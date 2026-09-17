i have to make A busy multi-level city-centre parking garage. Cars come and go all day, and the attendant needs to check a car in, check it out, and charge the right fee. Rates are tiered — the first hour is one price, each extra hour is cheaper, and there’s a daily cap so nobody is overcharged for a long stay; part-hours round up. Spots are limited and come in types — compact, standard, and EV (with a charger) — and an EV must get an EV spot. Drivers keep asking ‘is an EV spot free right now?’ and the attendant hunts for a car by its plate. By evening the log is huge.
Build the attendant something so every car is charged correctly and no spot is double-parked.
(The attendant’s day is the spec — build it for any garage, not one. Get check-in / check-out and the fee right first, then the spot types and lookups.)



 before starting the coding can you tell me what basic structure we should follow for this application? I want to understand the frontend backend and database part first.

 i want to use react for frontend and node js with express for backend. For database i want to use sql. Is that okay for this project and how should we connect everything?

 okay lets start with the database. What tables do i need for garage, floors, parking spots, vehicles and parking tickets? Also tell me the relationships between them.
 now help me create the parking spot logic. I have 3 types of spots compact standard and EV. An EV vehicle should never be given a normal spot. How should we handle this?

 how should the system find an available parking spot when a car comes in? Also make sure that if a spot is already occupied it cannot be assigned again.
 now lets make the vehicle check in feature. What details should i take from the attendant and what should happen in the database after a car is checked in?

 next i want to add check out. When the car leaves it should calculate the fee, save the checkout time and make the parking spot free again. Help me implement this.

 help me write the fee calculation logic. First hour should be $10, every extra hour $5 and daily maximum is $40. Also 1 hour 5 minutes should become 2 billable hours. Please keep this logic separate so it can be tested easily.

 can you add unit tests for the fee calculator? I want to test short parking times, exactly one hour, 1 hour 5 min, longer stays and the $40 daily cap.

i also need something on the dashboard which tells the attendant if an EV parking spot is free right now. What would be the easiest way to implement this?

 now add a search feature where the attendant can enter a license plate and quickly find the parked car. It should show the parking spot and floor also.

 the garage is multi level, so update the design so each floor has its own parking spots. I also want to show the spots floor wise on the dashboard.



 i want to make sure there is no chance of two cars getting the same parking spot, especially if two check ins happen almost at the same time. How can we handle this properly?

 the parking log can become really big by evening. I dont want the frontend to load everything at once. Can you add pagination and sorting to the transaction API and dashboard?

now lets work on the frontend. I want a simple dashboard for the attendant where they can see the floors, available spots, occupied spots and EV availability. Also add buttons for check in, check out and plate search.

i also need login for the attendant. Add register/login APIs and protect the parking APIs using JWT.

 the basic functionality is working. Now make the UI look more like a proper parking management dashboard instead of a basic form. Keep it clean and easy for an attendant to use.

i need a one page landing page also. It should explain what ParkPulse does, the main benefits and 3 features that can be added in the future.

 there is another twist in the challenge. I have to handle a messy rate card where rates are given for different parking spot types. The input data may contain incorrect formatting or junk values. Add a way to clean the rate data before using it for fee calculation.


 another requirement is a nightly automatic job. If a parking session stays open for more than 24 hours, the system should automatically close it and calculate the bill .The challenge says this will be tested using `POST /clock`. Please add this without breaking the normal checkout flow.


 one more feature is needed for a valet hand-off. An active parking session should be transferable to another license plate. The parking spot and original entry time should stay the same, only the plate should change.
 Please add the API and update the frontend if needed.


 now can you go through the whole application and check it against the original requirements and the three contest twists? Check the parking allocation, EV rules, fee calculation, daily cap, plate search, pagination, automatic 24 hour billing and session transfer.


 i found an error while running the application. I will send you the error message and code. Please find the reason for it and tell me exactly what needs to be changed.
before i submit this project, give me a final testing checklist. I want to make sure all the important features are working and there are no major issues.


 now help me prepare the required README.md and REASONING.md files. Keep them simple and explain the actual architecture, logic and decisions used in my application.

 everything is working now. I have updated the required files. Tell me what git commands i should use to add, commit and push all the final changes to my repository.

i want to add Readme.md and reasoning .md in which i have to write details of the project and logic so tell me what can i write in that too 
