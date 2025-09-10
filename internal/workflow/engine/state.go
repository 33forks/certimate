﻿package engine

import (
	"fmt"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"
)

type VariableState struct {
	Scope     string // 零值时表示全局的，否则表示指定节点的
	Key       string
	Value     any
	ValueType string
}

func (s VariableState) ValueString() string {
	switch s.ValueType {
	case "string":
		return s.Value.(string)
	case "number":
		return fmt.Sprintf("%d", s.Value)
	case "boolean":
		return strconv.FormatBool(s.Value.(bool))
	case "datetime":
		valueAsTime := s.Value.(time.Time)
		if valueAsTime.IsZero() {
			return "-"
		}
		return valueAsTime.Format(time.RFC3339)
	default:
		return fmt.Sprintf("%v", s.Value)
	}
}

type VariableManager interface {
	All() []VariableState
	Erase()

	Add(entry VariableState)
	Set(name string, value any, valueType string)
	SetScoped(scope string, name string, value any, valueType string)
	Get(name string) (*VariableState, bool)
	GetScoped(scope string, key string) (*VariableState, bool)
	Take(key string) (*VariableState, bool)
	TakeScoped(scope string, key string) (*VariableState, bool)
	Remove(key string) bool
	RemoveScoped(scope string, key string) bool

	RenderTemplateString(template string) string
}

type variableManager struct {
	statesMtx sync.RWMutex
	states    []VariableState
}

var _ VariableManager = (*variableManager)(nil)

func (m *variableManager) All() []VariableState {
	m.statesMtx.RLock()
	defer m.statesMtx.RUnlock()

	if m.states == nil {
		return make([]VariableState, 0)
	}

	return slices.Clone(m.states)
}

func (m *variableManager) Erase() {
	m.statesMtx.Lock()
	defer m.statesMtx.Unlock()

	m.states = make([]VariableState, 0)
}

func (m *variableManager) Add(state VariableState) {
	m.statesMtx.Lock()
	defer m.statesMtx.Unlock()

	if m.states == nil {
		m.states = make([]VariableState, 0)
	}

	for i, item := range m.states {
		if item.Scope == state.Scope && item.Key == state.Key {
			m.states[i] = state
			return
		}
	}
	m.states = append(m.states, state)
}

func (m *variableManager) Set(key string, value any, valueType string) {
	m.SetScoped("", key, value, valueType)
}

func (m *variableManager) SetScoped(scope string, key string, value any, valueType string) {
	m.Add(VariableState{Scope: scope, Key: key, Value: value, ValueType: valueType})
}

func (m *variableManager) Get(key string) (*VariableState, bool) {
	return m.GetScoped("", key)
}

func (m *variableManager) GetScoped(scope string, key string) (*VariableState, bool) {
	m.statesMtx.RLock()
	defer m.statesMtx.RUnlock()

	if m.states == nil {
		return nil, false
	}

	for _, item := range m.states {
		if item.Scope == scope && item.Key == key {
			return &item, true
		}
	}
	return nil, false
}

func (m *variableManager) Take(key string) (*VariableState, bool) {
	return m.TakeScoped("", key)
}

func (m *variableManager) TakeScoped(scope string, key string) (*VariableState, bool) {
	m.statesMtx.Lock()
	defer m.statesMtx.Unlock()

	if m.states == nil {
		return nil, false
	}

	for i, item := range m.states {
		if item.Scope == scope && item.Key == key {
			m.states = slices.Delete(m.states, i, i+1)
			return &item, true
		}
	}
	return nil, false
}

func (m *variableManager) Remove(key string) bool {
	return m.RemoveScoped("", key)
}

func (m *variableManager) RemoveScoped(scope string, key string) bool {
	_, ok := m.TakeScoped(scope, key)
	return ok
}

func (m *variableManager) RenderTemplateString(template string) string {
	m.statesMtx.RLock()
	defer m.statesMtx.RUnlock()

	replaceFunc := func(match string) string {
		mustache := strings.TrimSpace(match[2 : len(match)-2])
		if mustache == "" {
			return match
		}

		key := mustache[1:]
		if key == "" {
			return match
		} else if key == "$now" {
			return time.Now().Format(time.RFC3339)
		}

		// TODO: 支持作用域变量
		if state, ok := m.Get(key); ok {
			return state.ValueString()
		}

		return match
	}

	re := regexp.MustCompile(`\{\{\s*(\$[^\s]+)\s*\}\}`)
	return re.ReplaceAllStringFunc(template, replaceFunc)
}

func newVariableManager() VariableManager {
	return &variableManager{
		states: make([]VariableState, 0),
	}
}

type InOutState struct {
	NodeId     string
	Type       string
	Name       string
	Value      any
	ValueType  string
	Persistent bool
}

func (s InOutState) ValueString() string {
	switch s.ValueType {
	case "string":
		return s.Value.(string)
	case "number":
		return fmt.Sprintf("%d", s.Value)
	case "boolean":
		return strconv.FormatBool(s.Value.(bool))
	default:
		return fmt.Sprintf("%v", s.Value)
	}
}

type InOutManager interface {
	All() []InOutState
	Erase()

	Add(state InOutState)
	Set(nodeId string, stype string, name string, value any, valueType string, persistent bool)
	Get(nodeId string, name string) (*InOutState, bool)
	Take(nodeId string, name string) (*InOutState, bool)
	Remove(nodeId string, name string) bool
}

type inoutManager struct {
	statesMtx sync.RWMutex
	states    []InOutState
}

var _ InOutManager = (*inoutManager)(nil)

func (m *inoutManager) All() []InOutState {
	m.statesMtx.RLock()
	defer m.statesMtx.RUnlock()

	if m.states == nil {
		return make([]InOutState, 0)
	}

	return slices.Clone(m.states)
}

func (m *inoutManager) Erase() {
	m.statesMtx.Lock()
	defer m.statesMtx.Unlock()

	m.states = make([]InOutState, 0)
}

func (m *inoutManager) Add(state InOutState) {
	m.statesMtx.Lock()
	defer m.statesMtx.Unlock()

	if m.states == nil {
		m.states = make([]InOutState, 0)
	}

	for i, item := range m.states {
		if item.NodeId == state.NodeId && item.Name == state.Name {
			m.states[i] = state
			return
		}
	}
	m.states = append(m.states, state)
}

func (m *inoutManager) Set(nodeId string, stype string, name string, value any, valueType string, persistent bool) {
	m.Add(InOutState{NodeId: nodeId, Type: stype, Name: name, Value: value, ValueType: valueType, Persistent: persistent})
}

func (m *inoutManager) Get(nodeId string, name string) (*InOutState, bool) {
	m.statesMtx.RLock()
	defer m.statesMtx.RUnlock()

	if m.states == nil {
		return nil, false
	}

	for _, item := range m.states {
		if item.NodeId == nodeId && item.Name == name {
			return &item, true
		}
	}
	return nil, false
}

func (m *inoutManager) Take(nodeId string, name string) (*InOutState, bool) {
	m.statesMtx.Lock()
	defer m.statesMtx.Unlock()

	if m.states == nil {
		return nil, false
	}

	for i, item := range m.states {
		if item.NodeId == nodeId && item.Name == name {
			m.states = slices.Delete(m.states, i, i+1)
			return &item, true
		}
	}
	return nil, false
}

func (m *inoutManager) Remove(nodeId string, name string) bool {
	_, ok := m.Take(nodeId, name)
	return ok
}

func newInOutManager() InOutManager {
	return &inoutManager{
		states: make([]InOutState, 0),
	}
}

const (
	stateIOTypeRef = "ref"
)

const (
	stateVarKeyNodeId               = "node.id"               // ValueType: "string"
	stateVarKeyNodeName             = "node.name"             // ValueType: "string"
	stateVarKeyNodeSkipped          = "node.skipped"          // ValueType: "boolean"
	stateVarKeyCertificateDomain    = "certificate.domain"    // ValueType: "string"
	stateVarKeyCertificateDomains   = "certificate.domains"   // ValueType: "string"
	stateVarKeyCertificateNotBefore = "certificate.notBefore" // ValueType: "datetime"
	stateVarKeyCertificateNotAfter  = "certificate.notAfter"  // ValueType: "datetime"
	stateVarKeyCertificateHoursLeft = "certificate.hoursLeft" // ValueType: "number"
	stateVarKeyCertificateDaysLeft  = "certificate.daysLeft"  // ValueType: "number"
	stateVarKeyCertificateValidity  = "certificate.validity"  // ValueType: "boolean"
)
