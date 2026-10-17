import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "medigo_medicines_v1";

const demoMedicines = [
  {
    id: "demo-1",
    name: "Vitamin D",
    dose: "1 tablet",
    time: "08:00",
    taken: false,
  },
  {
    id: "demo-2",
    name: "Sample medication",
    dose: "1 tablet",
    time: "20:00",
    taken: false,
  },
];

function loadMedicines() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : demoMedicines;
    }

    return demoMedicines;
  } catch (error) {
    return demoMedicines;
  }
}

function formatTime(time) {
  if (!time || !time.includes(":")) {
    return time || "";
  }

  const parts = time.split(":");
  let hour = Number(parts[0]);
  const minutes = parts[1];
  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return String(hour) + ":" + minutes + " " + period;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function App() {
  const [medicines, setMedicines] = useState(loadMedicines);

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("08:00");
  const [notificationMessage, setNotificationMessage] = useState("");

  // Save medicines whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(medicines)
      );
    } catch (error) {
      console.error("Could not save medicines.");
    }
  }, [medicines]);

  // Check for medication reminders every 30 seconds.
  useEffect(() => {
    function checkReminders() {
      if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      const now = new Date();

      const currentHour = String(now.getHours()).padStart(2, "0");
      const currentMinute = String(now.getMinutes()).padStart(2, "0");

      const currentTime = currentHour + ":" + currentMinute;

      medicines.forEach((medicine) => {
        if (medicine.time !== currentTime || medicine.taken) {
          return;
        }

        const reminderKey =
          "medigo_reminded_" +
          medicine.id +
          "_" +
          currentTime +
          "_" +
          now.toDateString();

        try {
          if (sessionStorage.getItem(reminderKey)) {
            return;
          }

          new Notification("MediGo Reminder", {
            body: medicine.name + " - " + medicine.dose,
          });

          sessionStorage.setItem(reminderKey, "true");
        } catch (error) {
          console.error("Could not show medication reminder.");
        }
      });
    }

    checkReminders();

    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [medicines]);

  function addMedicine(event) {
    event.preventDefault();

    if (!name.trim() || !dose.trim() || !time) {
      return;
    }

    const newMedicine = {
      id: String(Date.now()) + "-" + String(Math.random()),
      name: name.trim(),
      dose: dose.trim(),
      time: time,
      taken: false,
    };

    setMedicines((currentMedicines) => [
      ...currentMedicines,
      newMedicine,
    ]);

    setName("");
    setDose("");
    setTime("08:00");
  }

  function toggleMedicine(id) {
    setMedicines((currentMedicines) =>
      currentMedicines.map((medicine) =>
        medicine.id === id
          ? { ...medicine, taken: !medicine.taken }
          : medicine
      )
    );
  }

  function deleteMedicine(id) {
    setMedicines((currentMedicines) =>
      currentMedicines.filter((medicine) => medicine.id !== id)
    );
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setNotificationMessage(
        "Your browser does not support notifications."
      );
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationMessage("Reminders are already enabled.");
      return;
    }

    if (Notification.permission === "denied") {
      setNotificationMessage(
        "Notifications are blocked in your browser settings."
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setNotificationMessage(
          "Medication reminders are enabled!"
        );
      } else {
        setNotificationMessage(
          "Notifications were not enabled. Check your browser permissions."
        );
      }
    } catch (error) {
      setNotificationMessage(
        "Could not enable notifications in this browser."
      );
    }
  }

  const totalMedicines = medicines.length;

  const takenMedicines = medicines.filter(
    (medicine) => medicine.taken
  ).length;

  const remainingMedicines = totalMedicines - takenMedicines;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-symbol">✚</div>
          <span>MediGo</span>
        </div>

        <p className="side-label">MENU</p>

        <div className="nav active">
          <span>⌂</span>
          Dashboard
        </div>

        <div className="sidebar-bottom">
          <span>💚</span>
          <p>Your health, one day at a time.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>My Dashboard</span>
          <div className="avatar">M</div>
        </header>

        <section className="welcome">
          <div className="welcome-text">
            <p className="eyebrow">
              YOUR PERSONAL HEALTH COMPANION
            </p>

            <h1>{getGreeting()}!</h1>

            <p className="welcome-note">
              Take care of yourself, one dose at a time.
            </p>
          </div>

          <div className="welcome-art">
            <div className="art-sun">☀️</div>
            <div className="art-leaf">🌿</div>
            <div className="art-heart">💚</div>
          </div>
        </section>

        <section className="section-intro">
          <div>
            <h2>Your daily overview</h2>
            <p>
              Here is how your medication routine is going.
            </p>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon purple">💊</div>
            <p>Total medicines</p>
            <h2>{totalMedicines}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Medicines taken</p>
            <h2>{takenMedicines}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Remaining</p>
            <h2>{remainingMedicines}</h2>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>My medications</h2>
                <p>Keep track of your daily doses.</p>
              </div>

              <span className="count">{totalMedicines}</span>
            </div>

            <div className="medicine-list">
              {medicines.length === 0 ? (
                <div className="empty-state">
                  <div>💊</div>
                  <h3>No medicines yet</h3>
                  <p>
                    Add your first medication using the form.
                  </p>
                </div>
              ) : (
                medicines.map((medicine) => (
                  <div
                    className="medicine"
                    key={medicine.id}
                  >
                    <div className="pill-icon">💊</div>

                    <div className="medicine-info">
                      <h3>{medicine.name}</h3>
                      <p>{medicine.dose}</p>
                      <span>
                        ◷ {formatTime(medicine.time)}
                      </span>
                    </div>

                    <div className="medicine-actions">
                      <button
                        type="button"
                        className={
                          medicine.taken
                            ? "taken-button"
                            : "take-button"
                        }
                        onClick={() =>
                          toggleMedicine(medicine.id)
                        }
                      >
                        {medicine.taken
                          ? "✓ Taken"
                          : "Mark taken"}
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        aria-label={"Delete " + medicine.name}
                        onClick={() =>
                          deleteMedicine(medicine.id)
                        }
                        title="Delete medication"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="kind-message">
              💚 Small steps every day make a difference.
            </div>
          </div>

          <div className="panel add-panel">
            <div className="panel-heading">
              <div>
                <h2>Add medication</h2>
                <p>
                  Enter your medication details below.
                </p>
              </div>

              <div className="plus">+</div>
            </div>

            <form
              className="medication-form"
              onSubmit={addMedicine}
            >
              <label htmlFor="medicine-name">
                Medicine name
              </label>

              <input
                id="medicine-name"
                type="text"
                placeholder="e.g. Vitamin D"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />

              <label htmlFor="medicine-dose">Dosage</label>

              <input
                id="medicine-dose"
                type="text"
                placeholder="e.g. 1 tablet"
                value={dose}
                onChange={(event) =>
                  setDose(event.target.value)
                }
                required
              />

              <label htmlFor="medicine-time">
                Reminder time
              </label>

              <input
                id="medicine-time"
                type="time"
                value={time}
                onChange={(event) =>
                  setTime(event.target.value)
                }
                required
              />

              <button
                type="submit"
                className="add-button"
              >
                + Add medication
              </button>
            </form>

            <p className="form-note">
              Double-check your medication and dosage details.
            </p>

            <div className="reminder-section">
              <h3>🔔 Medication reminders</h3>

              <p>
                Allow browser notifications to receive
                reminders while MediGo is open.
              </p>

              <button
                type="button"
                className="add-button"
                onClick={enableNotifications}
              >
                Enable reminders
              </button>

              {notificationMessage && (
                <p role="status" className="form-note">
                  {notificationMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        <footer className="bottom-note">
          <p>Made with 💚 for healthier habits.</p>
        </footer>

        <p className="disclaimer">
          MediGo is a medication tracking tool, not a
          substitute for professional medical advice. Follow
          your healthcare professional's instructions.
        </p>
      </main>
    </div>
  );
}

export default App;