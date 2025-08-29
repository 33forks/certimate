package providers

import (
	"fmt"

	"github.com/certimate-go/certimate/internal/domain"
	"github.com/certimate-go/certimate/pkg/core"
	"github.com/certimate-go/certimate/pkg/core/notifier/providers/discordbot"
	xmaps "github.com/certimate-go/certimate/pkg/utils/maps"
)

func init() {
	if err := Registries.Register(domain.NotificationProviderTypeDiscordBot, func(options *ProviderFactoryOptions) (core.Notifier, error) {
		access := domain.AccessConfigForDiscordBot{}
		if err := xmaps.Populate(options.AccessConfig, &access); err != nil {
			return nil, fmt.Errorf("failed to populate provider access config: %w", err)
		}

		provider, err := discordbot.NewNotifierProvider(&discordbot.NotifierProviderConfig{
			BotToken:  access.BotToken,
			ChannelId: xmaps.GetOrDefaultString(options.ProviderConfig, "channelId", access.ChannelId),
		})
		return provider, err
	}); err != nil {
		panic(err)
	}
}
