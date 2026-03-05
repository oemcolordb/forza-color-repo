import { POST } from '../route'

jest.mock('@libsql/client', () => ({
  createClient: jest.fn(() => ({
    execute: jest.fn().mockResolvedValue({ rows: [] })
  }))
}))

describe('/api/todos', () => {
  it('creates table successfully', async () => {
    const response = await POST()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('handles errors gracefully', async () => {
    const { createClient } = require('@libsql/client')
    createClient.mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(new Error('DB error'))
    }))

    const response = await POST()
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })
})
