'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Todo {
  id: string
  title: string
  completed: boolean
}

const API_URL = 'https://6a33980bc6ca2aee43866812.mockapi.io/api/v1/todos'
const ITEMS_PER_PAGE = 10

export default function TodoPage() {
  const queryClient = useQueryClient()
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: todos, isLoading, isError, error } = useQuery<Todo[]>({
    queryKey: ['todos', currentPage],
    queryFn: async () => {
      // 👇 ЭНД ЗАСВАР ХИЙСЭН: sortBy=id&order=desc нэмж шинэ датаг хамгийн дээр гаргана
      const res = await fetch(`${API_URL}?page=${currentPage}&limit=${ITEMS_PER_PAGE}&sortBy=id&order=desc`)
      if (!res.ok) throw new Error('Датаг татаж чадсангүй')
      return res.json()
    },
    staleTime: 5000,
  })

  const addTodoMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false })
      })
      if (!res.ok) throw new Error('Нэмж чадсангүй')
      return res.json()
    },
    onSuccess: () => {
      // 👇 Шинэ дата нэмэгдсэн тул шууд 1-р хуудас руу шилжүүлнэ
      setCurrentPage(1)
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setNewTodoTitle('')
    }
  })

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      })
      if (!res.ok) throw new Error('Төлөв өөрчилж чадсангүй')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return
    addTodoMutation.mutate(newTodoTitle)
  }

  if (isLoading) return <p className="p-8 text-center">Жинхэнэ датаг уншиж байна...</p>
  if (isError) return <p className="p-8 text-center text-red-500">Алдаа: {error.message}</p>

  return (
    <div className="max-w-md mx-auto mt-10 p-4 space-y-6 flex flex-col min-h-[80vh]">
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-center">Task: Shadcn TanStack</h1>

        <form onSubmit={handleAddTodo} className="flex gap-2">
          <Input 
            placeholder="Add new note..." 
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            disabled={addTodoMutation.isPending}
          />
          <Button type="submit" disabled={addTodoMutation.isPending}>
            {addTodoMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </form>

        <div className="space-y-3">
          {todos?.map((todo) => (
            <Card key={todo.id} className="shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox 
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  disabled={toggleTodoMutation.isPending}
                  onCheckedChange={(checked) => {
                    toggleTodoMutation.mutate({ id: todo.id, completed: !!checked })
                  }}
                />
                <label 
                  htmlFor={`todo-${todo.id}`}
                  className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {todo.title}
                </label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
              />
            </PaginationItem>
            
            {[1, 2, 3, 4].map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < 4) setCurrentPage(currentPage + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}