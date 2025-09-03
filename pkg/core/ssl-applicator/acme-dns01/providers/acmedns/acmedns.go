package acmedns

import (
	"errors"
	"fmt"
	"os"

	"github.com/go-acme/lego/v4/providers/dns/acmedns"

	"github.com/certimate-go/certimate/pkg/core"
)

type ChallengeProviderConfig struct {
	ServerUrl   string `json:"serverUrl"`
	Credentials string `json:"credentials"`
}

func NewChallengeProvider(config *ChallengeProviderConfig) (core.ACMEChallenger, error) {
	if config == nil {
		return nil, errors.New("the configuration of the acme challenge provider is nil")
	}

	tempfile, err := os.CreateTemp("", "certimate.acmedns_*.tmp")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp credentials file: %w", err)
	} else {
		if _, err := tempfile.Write([]byte(config.Credentials)); err != nil {
			return nil, fmt.Errorf("failed to write temp credentials file: %w", err)
		}

		tempfile.Close()
	}

	providerConfig := acmedns.NewDefaultConfig()
	providerConfig.APIBase = config.ServerUrl
	providerConfig.StoragePath = tempfile.Name()

	provider, err := acmedns.NewDNSProviderConfig(providerConfig)
	if err != nil {
		return nil, err
	}

	return provider, nil
}
