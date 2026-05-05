// Example Turso API implementation following the project's patterns
// This demonstrates the correct way to use the Turso database in this Forza Color Repository

import { getDb, ensureTables } from '@/app/lib/db'
import { NextResponse } from 'next/server'

// Example POST endpoint - creates todos table and adds a todo
export const POST = async () => {
  const client = getDb()

  try {
    // Ensure all tables exist (this is safe to call multiple times)
    await ensureTables()
    
    // Create todos table if it doesn't exist
    await client.execute('CREATE TABLE IF NOT EXISTS todos (description TEXT);')
    
    // Insert a sample todo
    const result = await client.execute({
      sql: 'INSERT INTO todos (description) VALUES (?)',
      args: ['Sample todo from Turso API example']
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Todo created successfully',
      id: result.lastInsertRowid
    })
  } catch (error) {
    console.error('Todos POST error:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

// Example GET endpoint - retrieves all todos
export const GET = async () => {
  const client = getDb()

  try {
    const result = await client.execute('SELECT * FROM todos ORDER BY rowid DESC')
    
    return NextResponse.json({ 
      success: true,
      todos: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Todos GET error:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

// Example DELETE endpoint - clears all todos
export const DELETE = async () => {
  const client = getDb()

  try {
    await client.execute('DELETE FROM todos')
    
    return NextResponse.json({ 
      success: true,
      message: 'All todos deleted'
    })
  } catch (error) {
    console.error('Todos DELETE error:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
