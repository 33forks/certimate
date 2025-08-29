package applicators

import (
	"fmt"

	"github.com/go-acme/lego/v4/challenge"

	"github.com/certimate-go/certimate/internal/domain"
	"github.com/certimate-go/certimate/pkg/core/ssl-applicator/acme-dns01/providers/powerdns"
	xmaps "github.com/certimate-go/certimate/pkg/utils/maps"
)

func init() {
	if err := ACMEDns01Registries.Register(domain.ACMEDns01ProviderTypePowerDNS, func(options *ProviderFactoryOptions) (challenge.Provider, error) {
		access := domain.AccessConfigForPowerDNS{}
		if err := xmaps.Populate(options.AccessConfig, &access); err != nil {
			return nil, fmt.Errorf("failed to populate provider access config: %w", err)
		}

		provider, err := powerdns.NewChallengeProvider(&powerdns.ChallengeProviderConfig{
			ServerUrl:                access.ServerUrl,
			ApiKey:                   access.ApiKey,
			AllowInsecureConnections: access.AllowInsecureConnections,
			DnsPropagationTimeout:    options.DnsPropagationTimeout,
			DnsTTL:                   options.DnsTTL,
		})
		return provider, err
	}); err != nil {
		panic(err)
	}
}
