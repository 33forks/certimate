﻿package certapply

import (
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"errors"
	"fmt"

	"github.com/go-acme/lego/v4/lego"
	"github.com/go-acme/lego/v4/registration"
	"golang.org/x/sync/singleflight"

	"github.com/certimate-go/certimate/internal/domain"
	"github.com/certimate-go/certimate/internal/repository"
	xcert "github.com/certimate-go/certimate/pkg/utils/cert"
)

var registrationSg singleflight.Group

type ACMEAccount = domain.ACMEAccount

func NewACMEAccount(config *ACMEConfig, email string, register bool) (*ACMEAccount, error) {
	if config == nil {
		return nil, errors.New("the acme config is nil")
	}
	if email == "" {
		return nil, errors.New("the email is empty")
	}

	ctx := context.Background()
	accountRepo := repository.NewACMEAccountRepository()
	account, err := accountRepo.GetByCAAndEmail(ctx, string(config.CAProvider), config.CADirUrl, email)
	if err != nil {
		if !domain.IsRecordNotFoundError(err) {
			return nil, fmt.Errorf("failed to get acme account record: %w", err)
		}
	}

	// register new acme account if not exists
	if account == nil {
		if !register {
			return nil, errors.New("the acme account does not exist")
		}

		key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
		if err != nil {
			return nil, err
		}

		keyPEM, err := xcert.ConvertECPrivateKeyToPEM(key)
		if err != nil {
			return nil, err
		}

		account = &ACMEAccount{
			CA:         string(config.CAProvider),
			Email:      email,
			PrivateKey: keyPEM,
			ACMEDirUrl: config.CADirUrl,
		}
		legoCfg := lego.NewConfig(account)
		legoCfg.CADirURL = config.CADirUrl
		legoClient, err := lego.NewClient(legoCfg)
		if err != nil {
			return nil, err
		}

		var regres *registration.Resource
		var regerr error
		if legoClient.GetExternalAccountRequired() {
			regres, regerr = legoClient.Registration.RegisterWithExternalAccountBinding(registration.RegisterEABOptions{
				TermsOfServiceAgreed: true,
				Kid:                  config.EABKid,
				HmacEncoded:          config.EABHmacEncoded,
			})
		} else {
			regres, regerr = legoClient.Registration.Register(registration.RegisterOptions{
				TermsOfServiceAgreed: true,
			})
		}
		if regerr != nil {
			return nil, fmt.Errorf("failed to register acme account: %w", err)
		}

		account.ACMEAccount = &regres.Body
		account.ACMEAcctUrl = regres.URI

		if _, err := accountRepo.Save(ctx, account); err != nil {
			return nil, fmt.Errorf("failed to save acme account record: %w", err)
		}
	}

	return account, nil
}

func NewACMEAccountWithSingleFlight(config *ACMEConfig, email string) (*ACMEAccount, error) {
	if config == nil {
		return nil, errors.New("the acme config is nil")
	}
	if email == "" {
		return nil, errors.New("the email is empty")
	}

	resp, err, _ := registrationSg.Do(fmt.Sprintf("%s|%s|%s", string(config.CAProvider), config.CADirUrl, email), func() (any, error) {
		return NewACMEAccount(config, email, true)
	})
	if err != nil {
		return nil, err
	}

	return resp.(*ACMEAccount), nil
}
