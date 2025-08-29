package applicators

import (
	"fmt"

	"github.com/go-acme/lego/v4/challenge"

	"github.com/certimate-go/certimate/internal/domain"
	azuredns "github.com/certimate-go/certimate/pkg/core/ssl-applicator/acme-dns01/providers/azure-dns"
	xmaps "github.com/certimate-go/certimate/pkg/utils/maps"
)

func init() {
	if err := ACMEDns01Registries.Register(domain.ACMEDns01ProviderTypeAzureDNS, func(options *ProviderFactoryOptions) (challenge.Provider, error) {
		access := domain.AccessConfigForAzure{}
		if err := xmaps.Populate(options.AccessConfig, &access); err != nil {
			return nil, fmt.Errorf("failed to populate provider access config: %w", err)
		}

		provider, err := azuredns.NewChallengeProvider(&azuredns.ChallengeProviderConfig{
			TenantId:              access.TenantId,
			ClientId:              access.ClientId,
			ClientSecret:          access.ClientSecret,
			CloudName:             access.CloudName,
			DnsPropagationTimeout: options.DnsPropagationTimeout,
			DnsTTL:                options.DnsTTL,
		})
		return provider, err
	}); err != nil {
		panic(err)
	}

	if err := ACMEDns01Registries.RegisterAlias(domain.ACMEDns01ProviderTypeAzure, domain.ACMEDns01ProviderTypeAzureDNS); err != nil {
		panic(err)
	}
}
