﻿package engine

import (
	"context"

	"github.com/certimate-go/certimate/internal/domain"
)

type certificateRepository interface {
	GetByWorkflowIdAndNodeId(ctx context.Context, workflowId string, workflowNodeId string) (*domain.Certificate, error)
	GetByWorkflowRunIdAndNodeId(ctx context.Context, workflowRunId string, workflowNodeId string) (*domain.Certificate, error)
	Save(ctx context.Context, certificate *domain.Certificate) (*domain.Certificate, error)
}

type workflowRunRepository interface {
	GetById(ctx context.Context, workflowRunId string) (*domain.WorkflowRun, error)
}

type workflowOutputRepository interface {
	GetByNodeId(ctx context.Context, workflowNodeId string) (*domain.WorkflowOutput, error)
	Save(ctx context.Context, workflowOutput *domain.WorkflowOutput) (*domain.WorkflowOutput, error)
	SaveWithCertificate(ctx context.Context, workflowOutput *domain.WorkflowOutput, certificate *domain.Certificate) (*domain.WorkflowOutput, error)
}

type settingsRepository interface {
	GetByName(ctx context.Context, name string) (*domain.Settings, error)
}
