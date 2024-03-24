import { useState } from 'react';
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
} from '@mui/material';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import DraftsIcon from '@mui/icons-material/Drafts';
import Modal from '@mui/material/Modal';

import Notify from './Notification';
import { Snackbar, Stack } from '@mui/joy';

const drawerWidth = 240;

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const today = dayjs();
  const minDate = today.startOf('day');

  const [selectedDate, setSelectedDate] = useState(minDate);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notify = () => {
    setNotificationOpen((prevOpen) => !prevOpen);
  };

  console.log(auth);

  const events = [
    {
      name: 'Trail Biking Bonanza',
      date: 'April 12, 2024',
      type: 'Trail Biking',
    },
    { name: 'Downtown Zumba', date: 'May 8, 2024', type: 'Zumba Session' },
    // Add more events here...
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
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
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
                    onChange={(date) => setSelectedDate(date)}
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
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom></Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
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
                  {event.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.type}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>
      {/* Notification */}
    </Box>
  );
};

export default Dashboard;
