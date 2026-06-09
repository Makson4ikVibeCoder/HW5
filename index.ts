// ==========================================
// 1. МОДЕЛІ ТА ТИПИ ДАНИХ (Models)
// ==========================================

type EventType = 'meeting' | 'task' | 'reminder';

interface BaseEvent {
  readonly id: number;
  readonly type: EventType;
  title: string;
  description: string;
  readonly createdAt: Date;
}

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

type AppEvent = MeetingEvent | TaskEvent | ReminderEvent;

type GetEventStructure<T extends EventType> = 
  T extends 'meeting' ? MeetingEvent :
  T extends 'task' ? TaskEvent :
  T extends 'reminder' ? ReminderEvent : never;

type GroupedEvents = {
  [K in EventType]: GetEventStructure<K>[];
};

type CreateEventDTO<T extends AppEvent> = Omit<T, 'id' | 'type' | 'createdAt'>;

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

function findById<T extends { readonly id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// ==========================================
// 3. МЕНЕДЖЕР ПОДІЙ (EventManager Service)
// ==========================================

class EventManager {
  private events: AppEvent[] = [];

  constructor(initialEvents: AppEvent[] = []) {
    this.events = initialEvents;
  }

  getAllEvents(): readonly AppEvent[] {
    return this.events;
  }

  addEvent<T extends AppEvent>(type: T['type'], dto: CreateEventDTO<T>): T {
    if (!dto.title || dto.title.trim() === '') {
      throw new Error("Валідація фейл: Назва події не може бути порожньою.");
    }

    const newId = this.events.length > 0 ? Math.max(...this.events.map(e => e.id)) + 1 : 1;
    const newEvent = {
      id: newId,
      type,
      ...dto,
      createdAt: new Date()
    };

    this.events.push(newEvent as any);
    return newEvent as any;
  }

  getEventsByType<T extends EventType>(type: T): GetEventStructure<T>[] {
    return this.events.filter(e => e.type === type) as any[];
  }

  filterEvents(predicate: (event: AppEvent) => boolean): AppEvent[] {
    return this.events.filter(predicate);
  }

  updateEvent(id: number, dto: any): AppEvent {
    const event = findById(this.events, id);
    if (!event) {
      throw new Error(`Помилка: Подію з ID ${id} не знайдено для оновлення.`);
    }
    Object.assign(event, dto);
    return event;
  }

  deleteEvent(id: number): void {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Помилка: Подію з ID ${id} не знайдено для видалення.`);
    }
    this.events.splice(index, 1);
  }

  getGroupedEvents(): GroupedEvents {
    const groups: GroupedEvents = {
      meeting: [],
      task: [],
      reminder: []
    };
    
    this.events.forEach(e => {
      if (isMeeting(e)) groups.meeting.push(e);
      else if (isTask(e)) groups.task.push(e);
      else if (isReminder(e)) groups.reminder.push(e);
    });
    
    return groups;
  }
}

// ==========================================
// 4. ДЕМОНСТРАЦІЯ РОБОТИ (Entry Point)
// ==========================================

const initialEventsData: AppEvent[] = [
  { id: 1, type: 'meeting', title: 'Зустріч по стартапу Holy Graill', description: 'Обговорення ресейл-додатку', createdAt: new Date(), location: 'Zoom', participants: ['ЛОл1', 'Лол2'] },
  { id: 2, type: 'meeting', title: 'Синхронізація процесу', description: 'Обговорення нових погодинних ставок', createdAt: new Date(), location: 'Офіс', participants: ['Адміністратор', 'Менеджер'] },
  { id: 3, type: 'meeting', title: 'Консультація ЧДБК', description: 'Здача лабораторних з комп’ютерної інженерії', createdAt: new Date(), location: 'Кафедра', participants: ['Викладач'] },
  
  { id: 4, type: 'task', title: 'Реалізувати RxJS фільтр', description: 'Використати combineLatest', createdAt: new Date(), deadline: new Date('2026-06-15'), isCompleted: true },
  { id: 5, type: 'task', title: 'Парсер на Python', description: 'Дописати селектори для Selenium', createdAt: new Date(), deadline: new Date('2026-06-20'), isCompleted: false },
  { id: 6, type: 'task', title: 'Tinkercad схема', description: 'Зібрати лічильник для практики', createdAt: new Date(), deadline: new Date('2026-06-18'), isCompleted: false },
  
  { id: 7, type: 'reminder', title: 'Дроп Rick Owens FW26', description: 'Перевірити наявність нових кросівок', createdAt: new Date(), remindAt: new Date('2026-07-01'), snoozeCount: 0 },
  { id: 8, type: 'reminder', title: 'Легіт-чек худі ERD', description: 'Відправити фото бірок експерту', createdAt: new Date(), remindAt: new Date('2026-06-12'), snoozeCount: 2 },
  { id: 9, type: 'reminder', title: 'Привітати когось там', description: 'Замовити квіти', createdAt: new Date(), remindAt: new Date('2026-06-14'), snoozeCount: 1 }
];

const manager = new EventManager(initialEventsData);

console.log('--- 1. СПИСОК УСІХ 9 ПОДІЙ ---');
console.table(manager.getAllEvents().map(e => ({ ID: e.id, Тип: e.type, Назва: e.title })));

console.log('\n--- 2. ПРИКЛАД ОТРИМАННЯ ПОДІЙ КОНКРЕТНОГО ТИПУ (Meeting) ---');
const meetings = manager.getEventsByType('meeting');
console.log(`Знайдено мітингів: ${meetings.length}`);
const firstMeeting = meetings[0];
if (firstMeeting && isMeeting(firstMeeting)) {
  console.log(`Перший мітинг локація: ${firstMeeting.location}, учасники: ${firstMeeting.participants.join(', ')}`);
}

console.log('\n--- 3. ДОДАВАННЯ НОВОЇ ПОДІЇ ТИПУ TASK ---');
const newTask = manager.addEvent<TaskEvent>('task', {
  title: 'Написати звіт по практиці в Обленерго',
  description: 'Оформити щоденник про роботу в техпідтримці',
  deadline: new Date('2026-06-25'),
  isCompleted: false
});
console.log('Додано новий таск успішно з ID:', newTask.id);

console.log('\n--- 4. ОНОВЛЕННЯ ПОДІЇ (ID: 5) ---');
const updated = manager.updateEvent(5, { description: 'Оновлено селектори Selenium та додано MongoDB збереження' });
console.log('Оновлена подія:', { ID: updated.id, Назва: updated.title, Опис: updated.description });

console.log('\n--- 5. ВИДАЛЕННЯ ПОДІЇ (ID: 4) ---');
manager.deleteEvent(4);
console.log('Подію 4 видалено. Загальна кількість подій тепер:', manager.getAllEvents().length);

console.log('\n--- 6. РЕЗУЛЬТАТ ФІЛЬТРАЦІЇ (Пошук слів "Holy Graill" або "Rick Owens" у назвах) ---');
const luxuryFiltered = manager.filterEvents(e => e.title.includes('Holy Graill') || e.title.includes('Rick Owens'));
console.table(luxuryFiltered.map(e => ({ ID: e.id, Назва: e.title, Тип: e.type })));

console.log('\n--- 7. ЗГРУПОВАНІ ЗА ТИПОМ ПОДІЇ (Словник / Mapped Type) ---');
const grouped = manager.getGroupedEvents();
console.log(`Мітингів: ${grouped.meeting.length}, Тасків: ${grouped.task.length}, Нагадувань: ${grouped.reminder.length}`);

console.log('\n--- 8. ОБРОБКА ПОМИЛОК (Спроба створити невалідну подію) ---');
try {
  manager.addEvent<ReminderEvent>('reminder', { title: '  ', description: 'Порожня назва', remindAt: new Date(), snoozeCount: 0 });
} catch (error: unknown) {
  if (error instanceof Error) console.log(`Перехоплено помилку: "${error.message}"`);
}