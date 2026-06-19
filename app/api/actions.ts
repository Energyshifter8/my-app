const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchTodos(page: number, limit: number) {
  if (!API_URL) throw new Error('API URL тохируулагдаагүй байна')
  
  const res = await fetch(`${API_URL}?page=${page}&limit=${limit}&sortBy=id&order=desc`)
  if (!res.ok) throw new Error('Датаг татаж чадсангүй')
  return res.json()
}

export async function addTodo(title: string, page: number, limit: number) {
  if (!API_URL) throw new Error('API URL тохируулагдаагүй байна')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, completed: false })
  })
  if (!res.ok) throw new Error('Нэмж чадсангүй')
  
  return fetchTodos(page, limit)
}

export async function toggleTodo(id: string, completed: boolean, page: number, limit: number) {
  if (!API_URL) throw new Error('API URL тохируулагдаагүй байна')

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  })
  if (!res.ok) throw new Error('Төлөв өөрчилж чадсангүй')
  
  return fetchTodos(page, limit)
}