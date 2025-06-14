package dns

import (
	"context"
	"net/http"
)

type QueryRecordListRequest struct {
	Domain   *string `json:"domain,omitempty"`
	Host     *string `json:"host,omitempty"`
	Type     *string `json:"type,omitempty"`
	LineCode *string `json:"lineCode,omitempty"`
	Value    *string `json:"value,omitempty"`
	State    *int32  `json:"state,omitempty"`
}

type QueryRecordListResponse struct {
	baseResult

	ReturnObj *struct {
		Records []*DnsRecord `json:"records,omitempty"`
	} `json:"returnObj,omitempty"`
}

func (c *Client) QueryRecordList(req *QueryRecordListRequest) (*QueryRecordListResponse, error) {
	return c.QueryRecordListWithContext(context.Background(), req)
}

func (c *Client) QueryRecordListWithContext(ctx context.Context, req *QueryRecordListRequest) (*QueryRecordListResponse, error) {
	httpreq, err := c.newRequest(http.MethodGet, "/v2/queryRecordList")
	if err != nil {
		return nil, err
	} else {
		httpreq.SetBody(req)
		httpreq.SetContext(ctx)
	}

	result := &QueryRecordListResponse{}
	if _, err := c.doRequestWithResult(httpreq, result); err != nil {
		return result, err
	}

	return result, nil
}
