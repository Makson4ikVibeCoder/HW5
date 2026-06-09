// ==========================================
// 1. МОДЕЛІ ТА ТИПИ ДАНИХ (Models)
// ==========================================

type EventType = 'meeting' | 'task' | 'reminder';

// Базовий інтерфейс події з readonly полями
interface BaseEvent {
  readonly id: number;
  readonly type: EventType;
  title: string;
  description: string;
  readonly createdAt: Date;
}

// Спеціалізовані інтерфейси (Discriminated Union members)
interface MeetingEvent extends BaseEvent {
  readonly type: 'meeting';
  location: string;
  participants: string[];
}

interface TaskEvent extends BaseEvent {
  readonly type: 'task';
  deadline: Date;
  isCompleted: boolean;
}

interface ReminderEvent extends BaseEvent {
  readonly type: 'reminder';
  remindAt: Date;
  snoozeCount: number;
}

// Discriminated Union
type AppEvent = MeetingEvent | TaskEvent | ReminderEvent;

// Conditional Type для динамічного виведення типу події за її літералом
type GetEventStructure<T extends EventType> = 
  T extends 'meeting' ? MeetingEvent :
  T extends 'task' ? TaskEvent :
  T extends 'reminder' ? ReminderEvent : never;

// Mapped Type + Record для типізованого словника згрупованих подій
type GroupedEvents = {
  [K in EventType]: GetEventStructure<K>[];
};

// Utility Types для створення та оновлення подій (виключаємо службові поля)
type CreateEventDTO<T extends AppEvent> = Omit<T, 'id' | 'type' | 'createdAt'>;
type UpdateEventDTO<T extends AppEvent> = Partial<Omit<T, 'id' | 'type' | 'createdAt'>>;

// ==========================================
// 2. TYPE GUARDS ТА GENERIC FUNCTIONS
// ==========================================

function isMeeting(event: AppEvent): event is MeetingEvent {
  return event.type === 'meeting';
}

function isTask(event: AppEvent): event is TaskEvent {
  return event.type === 'task';
}

function isReminder(event: AppEvent): event is ReminderEvent {
  return event.type === 'reminder';
}

// Generic Constraint функція для пошуку за ID
function findById<T extends { readonly id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}