export interface Task {
    title: string,
    listId?: string,
    location?: string,
    startTime?: string,
    endTime?: string,
    allDay?: boolean,
    isCompleted: boolean,
    description?: string,
    subTasks?: Array<any>,
    completionRate?: number,
    createdTimestamp?: any,
    updatedTimestamp?: any
}
