import { useState, useCallback, useEffect } from "react";

export default function HomePage() {
  const [timers, setTimers] = useState([]);
  const [active, setActive] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [timerName, setTimerName] = useState("");
  const [startDateValue, setStartDateValue] = useState("");
  const [startTimeValue, setStartTimeValue] = useState("");
  const [endDateValue, setEndDateValue] = useState("");
  const [endTimeValue, setEndTimeValue] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState("Medium");
  const [position, setPosition] = useState("Top");
  const [urgency, setUrgency] = useState("Color pulse");
  const [formError, setFormError] = useState("");
  const isEditing = Boolean(editingId);

  const loadTimers = useCallback(async () => {
    try {
      const response = await window.fetch("/api/timers");
      const data = await response.json();
      setTimers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadTimers();
  }, [loadTimers]);

  const resetForm = useCallback(() => {
    setTimerName("");
    setStartDateValue("");
    setStartTimeValue("");
    setEndDateValue("");
    setEndTimeValue("");
    setDescription("");
    setColor("#000000");
    setSize("Medium");
    setPosition("Top");
    setUrgency("Color pulse");
    setFormError("");
    setEditingId(null);
  }, []);

  const combineDateAndTime = useCallback((date, time) => {
    if (!date || !time) return null;
    const parsed = new Date(`${date}T${time}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }, []);

  const toInputDate = useCallback((value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const toInputTime = useCallback((value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    const hours = String(parsed.getHours()).padStart(2, "0");
    const minutes = String(parsed.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }, []);

  const closeModal = useCallback(() => {
    resetForm();
    setActive(false);
  }, [resetForm]);

  const openCreateModal = useCallback(() => {
    resetForm();
    setActive(true);
  }, [resetForm]);

  const openEditModal = useCallback(
    (timer) => {
      setEditingId(timer._id);
      setTimerName(timer.timerName || "");
      setStartDateValue(toInputDate(timer.startDate));
      setStartTimeValue(toInputTime(timer.startDate));
      setEndDateValue(toInputDate(timer.endDate));
      setEndTimeValue(toInputTime(timer.endDate));
      setDescription(timer.description || "");
      setColor(timer.color || "#000000");
      setSize(timer.timerSize || "Medium");
      setPosition(timer.timerPosition || "Top");
      setUrgency(timer.urgencyNotification || "Color pulse");
      setFormError("");
      setActive(true);
    },
    [toInputDate, toInputTime],
  );

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError("");

    const startDate = combineDateAndTime(startDateValue, startTimeValue);
    const endDate = combineDateAndTime(endDateValue, endTimeValue);

    if (!startDate || !endDate) {
      setFormError("Please provide valid start and end date/time.");
      return;
    }

    try {
      const existing = timers.find((timer) => timer._id === editingId);
      const url = isEditing ? `/api/timers/${editingId}` : "/api/timers";
      const method = isEditing ? "PUT" : "POST";

      await window.fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timerName,
          startDate,
          endDate,
          description,
          color,
          timerSize: size,
          timerPosition: position,
          urgencyNotification: urgency,
          active: existing?.active ?? true,
        }),
      });

      closeModal();
      loadTimers();
    } catch (err) {
      console.error(err);
      setFormError(`Failed to ${isEditing ? "update" : "create"} timer. Please try again.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await window.fetch(`/api/timers/${id}`, { method: "DELETE" });
      loadTimers();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTime = useCallback((value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString();
  }, []);

  return (
    <s-page
      heading="Countdown Timer Manager"
      subheading="Create and manage countdown timers for your promotions"
    >
      <s-section>
        <s-button variant="primary" onClick={openCreateModal}>
          Create timer
        </s-button>
      </s-section>

      <s-section heading="Timer List">
        {timers.length > 0 ? (
          <s-box padding="base">
            <s-stack gap="tight">
              {timers.map((timer) => (
                <s-box key={timer._id} padding="base" border="base" border-radius="base">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{timer.timerName}</div>
                      <div style={{ fontSize: "13px", color: "#616161", marginTop: "4px" }}>
                        {timer.description || "No description"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#616161" }}>
                        Start: {formatDateTime(timer.startDate)}
                      </div>
                      <div style={{ fontSize: "13px", color: "#616161" }}>
                        End: {formatDateTime(timer.endDate)}
                      </div>
                    </div>

                    <details style={{ position: "relative" }}>
                      <summary
                        style={{
                          listStyle: "none",
                          cursor: "pointer",
                          userSelect: "none",
                          fontSize: "24px",
                          lineHeight: 1,
                          color: "#616161",
                          padding: "0 4px",
                        }}
                      >
                        ⋯
                      </summary>
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "28px",
                          background: "#fff",
                          border: "1px solid #d1d1d1",
                          borderRadius: "8px",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
                          padding: "8px",
                          minWidth: "120px",
                          zIndex: 2,
                        }}
                      >
                        <s-stack gap="base">
                          <s-button onClick={() => openEditModal(timer)}>Edit</s-button>
                          <s-button tone="critical" onClick={() => handleDelete(timer._id)}>
                            Delete
                          </s-button>
                        </s-stack>
                      </div>
                    </details>
                  </div>
                </s-box>
              ))}
            </s-stack>
          </s-box>
        ) : (
          <s-banner heading="No timers found" tone="info">
            No timers found
          </s-banner>
        )}
      </s-section>

      {active ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "calc(100vh - 32px)",
              background: "#f6f6f7",
              borderRadius: "12px",
              border: "1px solid #d1d1d1",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderBottom: "1px solid #d1d1d1",
                background: "#efefef",
                fontWeight: 600,
              }}
            >
              <span>{isEditing ? "Edit Timer" : "Create New Timer"}</span>
              <s-button
                onClick={closeModal}
                accessibilityLabel="Close"
              >
                Close
              </s-button>
            </div>

            <form
              onSubmit={handleSave}
              style={{ display: "flex", flexDirection: "column", minHeight: 0 }}
            >
              <div style={{ overflowY: "auto", minHeight: 0, padding: "16px", flex: 1 }}>
                <s-stack gap="base">
                  <s-text-field
                    label="Timer name"
                    value={timerName}
                    onInput={(e) => setTimerName(e.currentTarget.value)}
                    placeholder="Enter timer name"
                    required
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                        Start date
                      </label>
                      <input
                        type="date"
                        value={startDateValue}
                        onChange={(e) => setStartDateValue(e.currentTarget.value)}
                        required
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #c9cccf",
                          padding: "10px 12px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          background: "#fff",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                        Start time
                      </label>
                      <input
                        type="time"
                        value={startTimeValue}
                        onChange={(e) => setStartTimeValue(e.currentTarget.value)}
                        required
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #c9cccf",
                          padding: "10px 12px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          background: "#fff",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                        End date
                      </label>
                      <input
                        type="date"
                        value={endDateValue}
                        onChange={(e) => setEndDateValue(e.currentTarget.value)}
                        required
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #c9cccf",
                          padding: "10px 12px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          background: "#fff",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                        End time
                      </label>
                      <input
                        type="time"
                        value={endTimeValue}
                        onChange={(e) => setEndTimeValue(e.currentTarget.value)}
                        required
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          border: "1px solid #c9cccf",
                          padding: "10px 12px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                          background: "#fff",
                        }}
                      />
                    </div>
                  </div>

                  <s-text-field
                    label="Promotion description"
                    value={description}
                    onInput={(e) => setDescription(e.currentTarget.value)}
                    placeholder="Enter promotion details"
                    multiline
                  />

                  <div style={{ maxWidth: "260px" }}>
                    <s-color-picker
                      value={color}
                      alpha
                      onInput={(e) => setColor(e.currentTarget.value)}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <s-select
                      label="Timer size"
                      value={size}
                      onChange={(e) => setSize(e.currentTarget.value)}
                    >
                      <s-option value="Small">Small</s-option>
                      <s-option value="Medium">Medium</s-option>
                      <s-option value="Large">Large</s-option>
                    </s-select>
                    <s-select
                      label="Timer position"
                      value={position}
                      onChange={(e) => setPosition(e.currentTarget.value)}
                    >
                      <s-option value="Top">Top</s-option>
                      <s-option value="Bottom">Bottom</s-option>
                      <s-option value="Custom">Custom</s-option>
                    </s-select>
                  </div>

                  <s-select
                    label="Urgency notification"
                    value={urgency}
                    onChange={(e) => setUrgency(e.currentTarget.value)}
                  >
                    <s-option value="None">None</s-option>
                    <s-option value="Color pulse">Color pulse</s-option>
                  </s-select>

                  {formError ? (
                    <div style={{ color: "#b42318", fontSize: "13px" }}>{formError}</div>
                  ) : null}
                </s-stack>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  padding: "12px 16px",
                  borderTop: "1px solid #d1d1d1",
                  background: "#efefef",
                }}
              >
                <s-button
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </s-button>
                <s-button type="submit" variant="primary">
                  {isEditing ? "Update timer" : "Create timer"}
                </s-button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </s-page>
  );
}
