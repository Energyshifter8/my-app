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

  const { 
    data: todos, 
    isLoading, 
    isError,       
    isSuccess,      
    error,
    refetch 
  } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
      if (!res.ok) throw new Error('isERROR')
      return res.json()
    },

    
    staleTime: 10 * 1000,      
    
    gcTime: 5 * 60 * 1000,       
    
    retry: 2,                   
    
    refetchInterval: 5000,       
    
    refetchOnWindowFocus: true,  
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
    onSuccess: (newTodo) => {
      queryClient.setQueryData(['todos'], (oldTodos: Todo[] | undefined) => {
        return oldTodos ? [newTodo, ...oldTodos] : [newTodo]
      })
      setNewTodoTitle('')
    }
  })

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return
    addTodoMutation.mutate(newTodoTitle)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Task: Tanstack and Shadcn</h1>

      {/* ERROR төлөв харуулах */}
      {isError && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          Алдаа гарлаа: {error?.message}
        </div>
      )}

      {/* SUCCESS төлөв харуулах (Жижиг мэдэгдэл) */}
      {isSuccess && (
        <p className="text-xs text-green-600 text-center">✓ Датаг серверээс амжилттай шинэчиллээ (5с тутамд)</p>
      )}

      <form onSubmit={handleAddTodo} className="flex gap-2">
        <Input 
          placeholder="new note title" 
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
        />
        <Button type="submit">add</Button>
      </form>

      {isLoading ? (
        <p className="text-center">loading.</p>
      ) : (
        <div className="space-y-3">
          {todos?.map((todo) => (
            <Card key={todo.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox id={`todo-${todo.id}`} checked={todo.completed} />
                <label htmlFor={`todo-${todo.id}`} className="text-sm">{todo.title}</label>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}