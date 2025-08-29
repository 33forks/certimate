package providers

import (
	"fmt"
	"strings"

	"github.com/samber/lo"

	"github.com/certimate-go/certimate/internal/domain"
	"github.com/certimate-go/certimate/pkg/core"
	tencentcloudssldeploy "github.com/certimate-go/certimate/pkg/core/ssl-deployer/providers/tencentcloud-ssl-deploy"
	xmaps "github.com/certimate-go/certimate/pkg/utils/maps"
)

func init() {
	if err := Registries.Register(domain.DeploymentProviderTypeTencentCloudSSLDeploy, func(options *ProviderFactoryOptions) (core.SSLDeployer, error) {
		access := domain.AccessConfigForTencentCloud{}
		if err := xmaps.Populate(options.AccessConfig, &access); err != nil {
			return nil, fmt.Errorf("failed to populate provider access config: %w", err)
		}

		provider, err := tencentcloudssldeploy.NewSSLDeployerProvider(&tencentcloudssldeploy.SSLDeployerProviderConfig{
			SecretId:     access.SecretId,
			SecretKey:    access.SecretKey,
			Endpoint:     xmaps.GetString(options.ProviderConfig, "endpoint"),
			Region:       xmaps.GetString(options.ProviderConfig, "region"),
			ResourceType: xmaps.GetString(options.ProviderConfig, "resourceType"),
			ResourceIds:  lo.Filter(strings.Split(xmaps.GetString(options.ProviderConfig, "resourceIds"), ";"), func(s string, _ int) bool { return s != "" }),
		})
		return provider, err
	}); err != nil {
		panic(err)
	}
}
