<h1>Ionic Planner</h1>

**Database**

The ionic planner uses Firestore to store the user's tasks and information.
The structure of the database is as follows:

collection: userProfile
    document: uid
        fields
        collection: user_lists
            document: 
                (default list) "all_tasks"
                GUID for other tasks
                    collection:
                        tasks (only in default list)
                        uncompleted_tasks (only contains ids to docs in tasks)
                        completed_tasks (as above)
                            document:
                                task

**components:** 
   - date-time-picker is used in the todo-details-item component
   - todo-details-item component is used for task creation and editing
   - expandable is used in the task-lists and home page to expand the task detail cards
   
**external components**
    - date-time-picker is using both the [date](https://www.logisticinfotech.com/blog/ionic4-datepicker-component/) picker and [time](https://www.logisticinfotech.com/blog/ionic-timepicker-component/) picker from logisticinfotech
    - calendar is using the [ionic 2 calendar](https://github.com/twinssbc/Ionic2-Calendar)
**services:**

todo:
   - list management handles the creation, editing, deletion, and getting of 
    the collections mentioned in database.
   - task management also does the same as above but for tasks. 
