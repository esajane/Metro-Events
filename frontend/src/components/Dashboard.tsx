import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
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
  Grid,
  Paper,
  IconButton,
} from '@mui/material';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import StarIcon from '@mui/icons-material/Star';
import DraftsIcon from '@mui/icons-material/Drafts';
import { Send as SendIcon, Event as EventIcon } from '@mui/icons-material';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import EventCard from './EventCard';

import { Snackbar, Stack } from '@mui/joy';

interface Event {
  id: string;
  name: string;
  description: string;
  type: string;
  date: string;
  image_url?: string;
  organizerId: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ParticipationStatus {
  [eventId: string]: string;
}

const Dashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [userParticipations, setUserParticipations] = useState<ParticipationStatus>({});
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs().startOf('day'));
  const [notification, setNotificationOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get('http://localhost:3000/events', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setAllEvents(eventsResponse.data || []);

        const participationResponse = await axios.get('http://localhost:3000/users/events', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const participationStatus = participationResponse.data.events.reduce((acc: { [id: string]: any }, event: { id: string, status: any }) => {
          acc[event.id] = event.status;
          return acc;
        }, {});

        setUserParticipations(participationStatus);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (auth.token) {
      fetchData();
    }
  }, [auth.token]);

  const handleJoinEvent = async (eventId: string) => {
    try {
      const response = await axios.post(`http://localhost:3000/events/${eventId}/participants`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      console.log(response);

      if (response.status === 201) {
        setUserParticipations(prev => ({ ...prev, [eventId]: 'pending' }));
      }
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const today = dayjs();
  const minDate = today.startOf('day');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notify = () => {
    setNotificationOpen((prevOpen) => !prevOpen);
  };

  const events: { name: string, date: string, type: string }[] = [
    {
      name: 'Trail Biking Bonanza',
      date: 'April 12, 2024',
      type: 'Trail Biking',
    },
    { name: 'Downtown Zumba', date: 'May 8, 2024', type: 'Zumba Session' },
  ];

  const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar style={{ justifyContent: 'space-between' }}>
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
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <Button
            className="p-4"
            variant="contained"
            size="large"
            style={{ margin: '8px' }}
            onClick={handleOpen}
          >
            Create Event
          </Button>
          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                style={{ margin: '5px' }}
              >
                Create Event
              </Typography>
              <TextField
                variant="outlined"
                label="Name"
                fullWidth
                style={{ margin: '3px' }}
              />
              <TextField
                variant="outlined"
                label="Description"
                fullWidth
                style={{ margin: '3px' }}
              />
              <TextField
                variant="outlined"
                label="Location"
                fullWidth
                style={{ margin: '3px' }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker
                    label="Date"
                    minDate={minDate}
                    value={selectedDate}
                    onChange={(date) => {
                      if (date !== null) {
                        setSelectedDate(date);
                      }
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
              <Button
                variant="contained"
                size="large"
                style={{ margin: '8px' }}
              >
                Confirm
              </Button>
            </Box>
          </Modal>
          <List>
            {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemIcon>
                  {index === 0 && <InboxIcon />}
                  {index === 1 && <StarIcon />}
                  {index === 2 && <SendIcon />}
                  {index === 3 && <DraftsIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container direction="row" spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {allEvents.map((event) => (
                <Grid item key={event.id} xs={12} md={12} lg={12}>
                  <EventCard
                    name={event.name}
                    date={event.date}
                    description={event.description}
                    imageUrl={event.image_url}
                    status={userParticipations[event.id] || 'not_joined'}
                    onJoinEvent={() => handleJoinEvent(event.id)}
                  />
                </Grid>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ padding: 2, height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Your Upcoming Events
              </Typography>
              <List>
                {allEvents.filter(event => userParticipations[event.id] === 'confirmed').map((event) => (
                  <ListItem key={event.id} button>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText primary={event.name} secondary={dayjs(event.date).format('MMMM D, YYYY')} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
