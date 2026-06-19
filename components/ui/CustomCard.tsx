import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface CustomCardProps {
  todo: Todo;
  isPending: boolean;
  onToggle: (id: string, completed: boolean) => void;
}

export function CustomCard({ todo, isPending, onToggle }: CustomCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={todo.completed}
          disabled={isPending}
          onCheckedChange={(checked) => onToggle(todo.id, !!checked)}
        />
        <label
          htmlFor={`todo-${todo.id}`}
          className={`text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}
        >
          {todo.title}
        </label>
      </CardContent>
    </Card>
  );
}
