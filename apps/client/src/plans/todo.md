1. V   remove or minimize round button in home screen (not needed for most users)
2. fix lack of auto-refresh after re-online
3. verify app can be logged in when offline (with last logged in user)
4. add Savta mode
5. add notifications for scheduled tasks
6. 0 is valid age
7. redefine Ointments fields
8. support 24 as once a day

I want you to think of a way to assiciate medicine to a family
I have a big DB with a lot of medicines and there is no need for each family to see the entire DB.




I need you to go over my project, which includes client and firestore DB, and consider that in the future there will be also a server and come with a plan with one or more options how to support offline state.
the goals for working offline support are:
1. only logged in users can continue working with their logged in user
1.1 new users or switch users functions should be unavailable when offline
2. when offline, I want the kids, and the current scheduled tasks to be available.
also all the medicines associate to this family to be available also.
2.1 when offline, user is allowed to log taking medication and see the log of last week
2.1 when offline, manage medicines (add/edit/remove) should be unavailable
also view history of tasks can be unavailable, also logs older than a week can be unavailable
3. when back online, I want that all changes that were done while offline to be sync
