package deployers

import (
	"fmt"

	"github.com/certimate-go/certimate/internal/domain"
	"github.com/certimate-go/certimate/pkg/core"
	opconsole "github.com/certimate-go/certimate/pkg/core/ssl-deployer/providers/1panel-console"
	xmaps "github.com/certimate-go/certimate/pkg/utils/maps"
)

func init() {
	if err := Registries.Register(domain.DeploymentProviderType1PanelConsole, func(options *ProviderFactoryOptions) (core.SSLDeployer, error) {
		credentials := domain.AccessConfigFor1Panel{}
		if err := xmaps.Populate(options.ProviderAccessConfig, &credentials); err != nil {
			return nil, fmt.Errorf("failed to populate provider access config: %w", err)
		}

		provider, err := opconsole.NewSSLDeployerProvider(&opconsole.SSLDeployerProviderConfig{
			ServerUrl:                credentials.ServerUrl,
			ApiVersion:               credentials.ApiVersion,
			ApiKey:                   credentials.ApiKey,
			AllowInsecureConnections: credentials.AllowInsecureConnections,
			AutoRestart:              xmaps.GetBool(options.ProviderExtendedConfig, "autoRestart"),
		})
		return provider, err
	}); err != nil {
		panic(err)
	}
}
