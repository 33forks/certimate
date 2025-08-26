﻿package engine

import (
	"fmt"
	"log/slog"
	"time"
)

type delayNodeExecutor struct {
	nodeExecutor
}

func (ne *delayNodeExecutor) Execute(execCtx *NodeExecutionContext) (*NodeExecutionResult, error) {
	execRes := newNodeExecutionResult(execCtx.Node)

	nodeCfg := execCtx.Node.Data.Config.AsDelay()
	ne.logger.Info(fmt.Sprintf("delay for %d second(s) before continuing ...", nodeCfg.Wait))

	time.Sleep(time.Duration(nodeCfg.Wait) * time.Second)

	return execRes, nil
}

func newDelayNodeExecutor() NodeExecutor {
	return &delayNodeExecutor{
		nodeExecutor: nodeExecutor{logger: slog.Default()},
	}
}
