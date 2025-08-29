package deployers

import (
	"fmt"

	"github.com/certimate-go/certimate/internal/domain"
	"github.com/certimate-go/certimate/pkg/core"
	gcorecdn "github.com/certimate-go/certimate/pkg/core/ssl-deployer/providers/gcore-cdn"
	xmaps "github.com/certimate-go/certimate/pkg/utils/maps"
)

func init() {
	if err := Registries.Register(domain.DeploymentProviderTypeGcoreCDN, func(options *ProviderFactoryOptions) (core.SSLDeployer, error) {
		access := domain.AccessConfigForGcore{}
		if err := xmaps.Populate(options.AccessConfig, &access); err != nil {
			return nil, fmt.Errorf("failed to populate provider access config: %w", err)
		}

		provider, err := gcorecdn.NewSSLDeployerProvider(&gcorecdn.SSLDeployerProviderConfig{
			ApiToken:      access.ApiToken,
			ResourceId:    xmaps.GetInt64(options.ProviderConfig, "resourceId"),
			CertificateId: xmaps.GetInt64(options.ProviderConfig, "certificateId"),
		})
		return provider, err
	}); err != nil {
		panic(err)
	}
}
