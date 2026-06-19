"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchTodos, addTodo, toggleTodo } from "@/app/api/actions";
import { CustomCard } from "@/components/ui/CustomCard";
import { CustomPagination } from "@/components/ui/CustomPagination";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function TodoPage() {
  const queryClient = useQueryClient();
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos", currentPage],
    queryFn: () => fetchTodos(currentPage, ITEMS_PER_PAGE),
    staleTime: 5000,
  });

  const addTodoMutation = useMutation({
    mutationFn: (title: string) => addTodo(title, currentPage, ITEMS_PER_PAGE),
    onSuccess: () => {
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodoTitle("");
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTodo(id, completed, currentPage, ITEMS_PER_PAGE),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    addTodoMutation.mutate(newTodoTitle);
  };

  if (isLoading) return <p className="p-8 text-center">Loading real data...</p>;
  if (isError)
    return (
      <p className="p-8 text-center text-red-500">Error: {error.message}</p>
    );

  return (
    <div className="max-w-md mx-auto mt-10 p-4 space-y-6 flex flex-col min-h-[80vh]">
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Task : Shadcn TanStack
        </h1>

        <form onSubmit={handleAddTodo} className="flex gap-2">
          <Input
            placeholder="Add new note..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            disabled={addTodoMutation.isPending}
          />
          <Button type="submit" disabled={addTodoMutation.isPending}>
            {addTodoMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </form>

        <div className="space-y-3">
          {todos?.map((todo) => (
            <CustomCard
              key={todo.id}
              todo={todo}
              isPending={toggleTodoMutation.isPending}
              onToggle={(id, completed) =>
                toggleTodoMutation.mutate({ id, completed })
              }
            />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <CustomPagination
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
