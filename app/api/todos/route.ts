import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '../../lib/db'
import { v4 as uuidv4 } from 'uuid'

// GET: Fetch all todos
export const GET = async () => {
  try {
    await ensureTables()
    const db = getDb()
    const result = await db.execute('SELECT * FROM todos ORDER BY created_at DESC')
    return NextResponse.json({ success: true, todos: result.rows })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST: Add a new todo
export const POST = async (request: Request) => {
  try {
    const { description } = await request.json()
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    await ensureTables()
    const db = getDb()
    const id = uuidv4()
    
    await db.execute({
      sql: 'INSERT INTO todos (id, description, completed) VALUES (?, ?, 0)',
      args: [id, description]
    })
    
    return NextResponse.json({ success: true, todo: { id, description, completed: 0 } })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// PUT: Update a todo (toggle completed or update description)
export const PUT = async (request: Request) => {
  try {
    const { id, description, completed } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await ensureTables()
    const db = getDb()

    if (description !== undefined && completed !== undefined) {
      await db.execute({
        sql: 'UPDATE todos SET description = ?, completed = ? WHERE id = ?',
        args: [description, completed ? 1 : 0, id]
      })
    } else if (description !== undefined) {
      await db.execute({
        sql: 'UPDATE todos SET description = ? WHERE id = ?',
        args: [description, id]
      })
    } else if (completed !== undefined) {
      await db.execute({
        sql: 'UPDATE todos SET completed = ? WHERE id = ?',
        args: [completed ? 1 : 0, id]
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DELETE: Remove a todo
export const DELETE = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await ensureTables()
    const db = getDb()
    await db.execute({
      sql: 'DELETE FROM todos WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
