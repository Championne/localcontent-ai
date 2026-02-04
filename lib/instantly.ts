/**
 * Instantly.ai API Client
 * Documentation: https://developer.instantly.ai/
 */

const INSTANTLY_API_URL = 'https://api.instantly.ai/api/v1'

interface InstantlyResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface InstantlyCampaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  created_at: string
  updated_at: string
}

interface InstantlyLead {
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  website?: string
  custom_variables?: Record<string, string>
}

interface InstantlyEmailAccount {
  email: string
  first_name: string
  last_name: string
  warmup_enabled: boolean
  daily_limit: number
}

interface CampaignStats {
  total_leads: number
  emails_sent: number
  emails_opened: number
  unique_opens: number
  emails_replied: number
  emails_bounced: number
  unsubscribed: number
}

class InstantlyClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.INSTANTLY_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Instantly API key not configured')
    }
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<InstantlyResponse<T>> {
    try {
      const url = `${INSTANTLY_API_URL}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      // Instantly uses api_key as query param or in body
      const requestBody = body ? { ...body as object, api_key: this.apiKey } : { api_key: this.apiKey }

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(requestBody) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Instantly API error:', errorText)
        return { success: false, error: errorText }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Instantly API request failed:', error)
      return { success: false, error: String(error) }
    }
  }

  // ==================== CAMPAIGNS ====================

  /**
   * List all campaigns
   */
  async listCampaigns(): Promise<InstantlyResponse<InstantlyCampaign[]>> {
    return this.request<InstantlyCampaign[]>('/campaign/list', 'POST')
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string): Promise<InstantlyResponse<InstantlyCampaign>> {
    return this.request<InstantlyCampaign>('/campaign/get', 'POST', {
      campaign_id: campaignId,
    })
  }

  /**
   * Get campaign analytics/stats
   */
  async getCampaignStats(campaignId: string): Promise<InstantlyResponse<CampaignStats>> {
    return this.request<CampaignStats>('/analytics/campaign/summary', 'POST', {
      campaign_id: campaignId,
    })
  }

  /**
   * Launch/activate a campaign
   */
  async launchCampaign(campaignId: string): Promise<InstantlyResponse<{ status: string }>> {
    return this.request('/campaign/launch', 'POST', {
      campaign_id: campaignId,
    })
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(campaignId: string): Promise<InstantlyResponse<{ status: string }>> {
    return this.request('/campaign/pause', 'POST', {
      campaign_id: campaignId,
    })
  }

  // ==================== LEADS ====================

  /**
   * Add leads to a campaign
   */
  async addLeads(
    campaignId: string,
    leads: InstantlyLead[],
    options?: {
      skip_if_in_workspace?: boolean
      skip_if_in_campaign?: boolean
    }
  ): Promise<InstantlyResponse<{ uploaded: number; skipped: number }>> {
    return this.request('/lead/add', 'POST', {
      campaign_id: campaignId,
      leads: leads,
      skip_if_in_workspace: options?.skip_if_in_workspace ?? true,
      skip_if_in_campaign: options?.skip_if_in_campaign ?? true,
    })
  }

  /**
   * Get lead status in a campaign
   */
  async getLeadStatus(
    campaignId: string,
    email: string
  ): Promise<InstantlyResponse<{
    email: string
    status: string
    emails_sent: number
    emails_opened: number
    replied: boolean
  }>> {
    return this.request('/lead/get', 'POST', {
      campaign_id: campaignId,
      email: email,
    })
  }

  /**
   * List leads in a campaign with pagination
   */
  async listLeads(
    campaignId: string,
    options?: {
      limit?: number
      skip?: number
      status?: string
    }
  ): Promise<InstantlyResponse<InstantlyLead[]>> {
    return this.request('/lead/list', 'POST', {
      campaign_id: campaignId,
      limit: options?.limit || 100,
      skip: options?.skip || 0,
      status: options?.status,
    })
  }

  /**
   * Delete/remove a lead from campaign
   */
  async removeLead(
    campaignId: string,
    email: string
  ): Promise<InstantlyResponse<{ deleted: boolean }>> {
    return this.request('/lead/delete', 'POST', {
      campaign_id: campaignId,
      email: email,
    })
  }

  /**
   * Update lead data
   */
  async updateLead(
    campaignId: string,
    email: string,
    data: Partial<InstantlyLead>
  ): Promise<InstantlyResponse<InstantlyLead>> {
    return this.request('/lead/update', 'POST', {
      campaign_id: campaignId,
      email: email,
      ...data,
    })
  }

  // ==================== EMAIL ACCOUNTS ====================

  /**
   * List all connected email accounts
   */
  async listEmailAccounts(): Promise<InstantlyResponse<InstantlyEmailAccount[]>> {
    return this.request<InstantlyEmailAccount[]>('/account/list', 'POST')
  }

  /**
   * Get email account warmup status
   */
  async getWarmupStatus(email: string): Promise<InstantlyResponse<{
    email: string
    warmup_enabled: boolean
    warmup_reputation: number
    daily_sent: number
    daily_limit: number
  }>> {
    return this.request('/account/warmup/status', 'POST', {
      email: email,
    })
  }

  // ==================== ANALYTICS ====================

  /**
   * Get overall account analytics
   */
  async getAccountAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<InstantlyResponse<{
    total_sent: number
    total_opened: number
    total_replied: number
    total_bounced: number
  }>> {
    return this.request('/analytics/overview', 'POST', {
      start_date: startDate,
      end_date: endDate,
    })
  }

  // ==================== WEBHOOK VERIFICATION ====================

  /**
   * Verify webhook signature (if Instantly provides one)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implement if Instantly provides webhook signatures
    // For now, we trust the source based on our endpoint being secret
    return true
  }
}

// Export singleton instance
export const instantly = new InstantlyClient()

// Export class for custom instances
export { InstantlyClient }

// Export types
export type { InstantlyCampaign, InstantlyLead, InstantlyEmailAccount, CampaignStats }
