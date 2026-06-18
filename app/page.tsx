'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

interface Todo {
  id: number
  title: string
  completed: boolean
}

export default function TodoPage() {
  const queryClient = useQueryClient()
  const [newTodoTitle, setNewTodoTitle] = useState('')

  const { data: todos, isLoading, error } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
      if (!res.ok) throw new Error('Дата татаж чадсангүй')
      return res.json()
    }
  })

  const addTodoMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false, userId: 1 })
      })
      return res.json()
    },
    // Амжилттай болбол кэш доторх хуучин датаг хүчингүй болгож, жагсаалтыг шинэчилнэ
    onSuccess: (newTodo) => {
      // JSONPlaceholder жинхэнэ датабэйс рүү хадгалдаггүй тул UI дээр шууд харуулахын тулд кэшийг гараар шинэчилж байна
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] | undefined) => {
        return oldTodos ? [newTodo, ...oldTodos] : [newTodo]
      })
      setNewTodoTitle('') // Input талбарыг цэвэрлэнэ
    }
  })

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      })
      return res.json()
    },
    onSuccess: (updatedTodo) => {
      // Кэш дотор байгаа яг тэр өөрчлөгдсөн todo-ийн төлвийг шинэчилнэ
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] | undefined) => {
        return oldTodos?.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo)
      })
    }
  })

  // Нэмэх товч дарах үед ажиллах функц
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return
    addTodoMutation.mutate(newTodoTitle)
  }

  if (isLoading) return <p className="p-8 text-center">Уншиж байна...</p>
  if (error) return <p className="p-8 text-center text-red-500">Алдаа гарлаа!</p>

  return (
    <div className="max-w-md mx-auto mt-10 p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">TanStack + Shadcn UI</h1>

      {/* Шинээр нэмэх Form хэсэг */}
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <Input 
          placeholder="Шинэ тэмдэглэл бичих..." 
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          disabled={addTodoMutation.isPending}
        />
        <Button type="submit" disabled={addTodoMutation.isPending}>
          {addTodoMutation.isPending ? 'Нэмж байна...' : 'Нэмэх'}
        </Button>
      </form>

      {/* Тэмдэглэлүүдийн жагсаалт */}
      <div className="space-y-3">
        {todos?.map((todo) => (
          <Card key={todo.id} className="shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              {/* Shadcn Checkbox */}
              <Checkbox 
                id={`todo-${todo.id}`}
                checked={todo.completed}
                onCheckedChange={(checked) => {
                  toggleTodoMutation.mutate({ id: todo.id, completed: !!checked })
                }}
              />
              <label 
                htmlFor={`todo-${todo.id}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  todo.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {todo.title}
              </label>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}