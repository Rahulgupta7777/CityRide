# CityRide – Static City Bus Info & Route Finder

CityRide is a **mobile application built with React Native and Expo** that helps passengers explore **city bus routes and plan journeys without live GPS**.

---

## 📌 Key Features

###  Bus Routes Database (Offline)
- All bus data stored in `data/routes.json`
- Each route includes:
  - Route name / number
  - Stops in order
  - First & last bus timings
  - Bus frequency (e.g., every 20 minutes)
  - Estimated travel time between stops

###  Search System
- Search by **route name**
- Search by **stop name** (see routes passing through the stop)

###  Route Details
- Full stop list in order
- First / last bus timings
- Frequency of bus arrivals
- **Next bus estimate** based on current time + frequency

###  Journey Planner (Same Route Only)
- Select source & destination stops within the same route
- Displays:
  - Number of stops between them
  - Estimated travel time

###  Favorites & Recent Searches
- Mark bus routes as favorites
- Offline favorites using AsyncStorage
- Auto-save recent searched routes

---



