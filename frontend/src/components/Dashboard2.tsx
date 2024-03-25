import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  TextField,
  ListItemButton,
} from "@mui/material";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SendIcon from "@mui/icons-material/Send";
import DraftsIcon from "@mui/icons-material/Drafts";
import Modal from "@mui/material/Modal";

import Notify from "./Notification";
import { Snackbar, Stack } from "@mui/joy";
import axios from "axios";

function convertDateFormat(dateString) {
  const options = {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", options);
}

const drawerWidth = 240;

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await axios.get("http://localhost:3000/events", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      setEvents(response.data);
    };

    const fetchNotifications = async () => {
      const response = await axios.get(
        "http://localhost:3000/events/notifications",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      setNotifications(response.data);
    };

    fetchEvents();
    fetchNotifications();
  }, [auth.token]);

  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const today = dayjs();
  const minDate = today.startOf("day");
  const [selectedDate, setSelectedDate] = useState(minDate);

  useEffect(() => {
    setEventDetails({ ...eventDetails, date: selectedDate.toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateEvent = async () => {
    const response = await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(eventDetails),
    });

    const data = await response.json();
    // event info is at data.event
    setEvents([...events, data.event]);
    handleClose();
  };

  const handleItemClick = (index) => {
    setFocusedIndex(index);
  };

  const notify = () => {
    setNotificationOpen((prevOpen) => !prevOpen);
  };

  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 900,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar style={{ justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap component="div">
            Username: {auth?.user?.username}
          </Typography>
          <Button onClick={notify}>
            <Avatar />
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          {auth.user?.role === "organizer" && (
            <Button
              className="p-4"
              variant="contained"
              size="large"
              style={{ margin: "8px" }}
              onClick={handleOpen}
            >
              Create Event
            </Button>
          )}
          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                style={{ margin: "5px" }}
              >
                Create Event
              </Typography>
              <TextField
                variant="outlined"
                label="Name"
                fullWidth
                value={eventDetails.name}
                onChange={(e) =>
                  setEventDetails({ ...eventDetails, name: e.target.value })
                }
                style={{ margin: "3px" }}
              />
              <TextField
                variant="outlined"
                label="Description"
                fullWidth
                value={eventDetails.description}
                onChange={(e) =>
                  setEventDetails({
                    ...eventDetails,
                    description: e.target.value,
                  })
                }
                style={{ margin: "3px" }}
              />
              <TextField
                variant="outlined"
                label="Location"
                fullWidth
                value={eventDetails.location}
                onChange={(e) =>
                  setEventDetails({
                    ...eventDetails,
                    location: e.target.value,
                  })
                }
                style={{ margin: "3px" }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Date"
                    minDate={minDate}
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                  />
                </DemoContainer>
              </LocalizationProvider>
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateEvent}
                style={{ margin: "8px" }}
              >
                Confirm
              </Button>
            </Box>
          </Modal>
          <List>
            {["Events", "Notifications", "Send email", "Drafts"].map(
              (text, index) => (
                <ListItemButton
                  key={text}
                  autoFocus={index === 0}
                  selected={focusedIndex === index}
                  onClick={() => handleItemClick(index)}
                >
                  <ListItemIcon>
                    {index === 0 && <EventIcon />}
                    {index === 1 && <NotificationsIcon />}
                    {index === 2 && <SendIcon />}
                    {index === 3 && <DraftsIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              )
            )}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom></Typography>
        {focusedIndex === 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}
          >
            {events.map((event, index) => (
              <Card key={index} sx={{ maxWidth: 345 }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {convertDateFormat(event.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {notifications.map((notification, index) => (
              <Card key={index} sx={{ minWidth: 500 }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {notification.eventName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {convertDateFormat(notification.created_at)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      {/* Notification */}
    </Box>
  );
};

export default Dashboard;
