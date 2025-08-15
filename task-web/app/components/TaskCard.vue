<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Task, TaskStatus } from '../types'
import { toast } from 'vue-sonner'
import { useTasksStore } from '../stores/tasks'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from './ui/alert-dialog'
import { MoreHorizontal, File, Pencil, Trash2, MessageCircleMore } from 'lucide-vue-next'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ (e: 'edit', task: Task): void }>()

const store = useTasksStore()

/** --- Estado UI --- */
const editorOpen = ref(false)         // <- panel 2 columnas
const confirmDeleteOpen = ref(false)

const newComment = ref('')
const file = ref<File | null>(null)

/** --- Form edición (columna izquierda) --- */
const editTitle = ref(props.task.title ?? '')
const editStatus = ref<TaskStatus | ''>(props.task.status as TaskStatus)

/** Sincroniza si cambia la tarea desde fuera */
watch(() => props.task, (t) => {
  editTitle.value = t.title ?? ''
  editStatus.value = t.status as TaskStatus
}, { deep: true })

/** --- Derivados --- */
const statusBadgeVariant = computed<'secondary' | 'default' | 'outline'>(() => {
  switch (props.task.status) {
    case 'in_progress': return 'default'
    case 'reviews':     return 'secondary'
    case 'completed':   return 'outline'
    case 'done':        return 'outline'
    default:            return 'secondary'
  }
})

/** --- Acciones --- */
const openEditor = () => { editorOpen.value = true }

const saveEdits = async () => {
  const payload: Partial<Pick<Task, 'title' | 'status'>> & {
    // Aseguramos tipos opcionales que tu store normaliza
    category_ids?: number[]
    assignee_ids?: number[]
  } = {
    title: editTitle.value,
    status: editStatus.value as TaskStatus,
    category_ids: undefined,
    assignee_ids: undefined
  }

  try {
    await store.update(props.task.id, payload as any)
    toast.success('Cambios guardados')
    editorOpen.value = false
  } catch {
    toast.error('No se pudo guardar')
  }
}

const submitComment = async () => {
  const body = newComment.value.trim()
  if (!body) return toast.error('Comentario vacío')
  try {
    await store.addComment(props.task.id, body)
    toast.success('Comentario agregado')
    newComment.value = ''
  } catch {
    toast.error('No se pudo agregar el comentario')
  }
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}

const submitAttachment = async () => {
  if (!file.value) return toast.error('Selecciona un archivo')
  try {
    await store.uploadAttachment(props.task.id, file.value)
    toast.success('Archivo adjuntado')
    file.value = null
  } catch {
    toast.error('No se pudo adjuntar el archivo')
  }
}

const confirmDelete = async () => {
  try {
    await store.remove(props.task.id)
    toast.success('Tarea eliminada')
    confirmDeleteOpen.value = false
    editorOpen.value = false
  } catch {
    toast.error('No se pudo eliminar la tarea')
  }
}
</script>

<template>
  <Card class="relative overflow-hidden">
    <!-- Botón opcional para abrir editor (arriba derecha) -->
    <div class="absolute right-2 top-2 z-10">
      <Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Editar" @click.stop="openEditor">
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    </div>

    <!-- ZONA CLICK: todo antes del footer abre el editor -->
    <div class="cursor-pointer" @click="openEditor">
      <CardHeader class="pr-12">
        <div class="flex items-start justify-between gap-2">
          <CardTitle class="text-base leading-6">
            {{ props.task.title }}
          </CardTitle>
          <Badge :variant="statusBadgeVariant" class="whitespace-nowrap">
            {{ props.task.status }}
          </Badge>
        </div>
      </CardHeader>

      <CardContent class="text-sm text-muted-foreground">
        <!-- Mantengo minimal para evitar errores de tipo -->
      </CardContent>
    </div>

    <!-- FOOTER (no abre editor) -->
    <CardFooter class="flex items-center justify-between gap-2">
      <div class="text-xs text-muted-foreground">
        Comentarios: {{ props.task.comments_count ?? 0 }}
      </div>
      <div class="flex items-center gap-2">
        <Button size="sm" variant="secondary" @click="$emit('edit', props.task)">
          <Pencil class="mr-1 h-4 w-4" /> Editar
        </Button>
      </div>
    </CardFooter>

    <!-- EDITOR 2 COLUMNAS -->
    <Dialog v-model:open="editorOpen">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar tarea</DialogTitle>
        </DialogHeader>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Columna izquierda: Formulario de edición -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Título</label>
              <input
                v-model="editTitle"
                type="text"
                class="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Título de la tarea"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Estado</label>
              <select
                v-model="editStatus"
                class="w-full rounded-md border px-3 py-2 text-sm bg-white"
              >
                <option value="in_progress">in_progress</option>
                <option value="reviews">reviews</option>
                <option value="completed">completed</option>
                <option value="done">done</option>
              </select>
            </div>

            <div class="pt-2">
              <Button class="w-full" @click="saveEdits">Guardar cambios</Button>
            </div>
          </div>

          <!-- Columna derecha: acciones verticales -->
          <div class="space-y-6">
            <!-- Dejar comentario -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm font-medium">
                <MessageCircleMore class="h-4 w-4" /> Dejar comentario
              </div>
              <textarea
                v-model="newComment"
                rows="4"
                class="w-full rounded-md border p-2 text-sm"
                placeholder="Escribe tu comentario..."
              ></textarea>
              <div class="flex justify-end">
                <Button variant="outline" @click="submitComment">Enviar comentario</Button>
              </div>
            </div>

            <!-- Attachment -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm font-medium">
                <File class="h-4 w-4" /> Adjuntar archivo
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                @change="onFileChange"
                class="text-sm"
              />
              <div class="flex justify-end">
                <Button :disabled="!file" variant="outline" @click="submitAttachment">
                  Subir
                </Button>
              </div>
            </div>

            <!-- Eliminar -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm font-medium text-red-600">
                <Trash2 class="h-4 w-4" /> Eliminar tarea
              </div>
              <Button class="w-full bg-red-600 hover:bg-red-700" @click="confirmDeleteOpen = true">
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" @click="editorOpen = false">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Confirmación eliminar -->
    <AlertDialog v-model:open="confirmDeleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="confirmDeleteOpen = false">Cancelar</AlertDialogCancel>
          <AlertDialogAction class="bg-red-600 hover:bg-red-700" @click="confirmDelete">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>
