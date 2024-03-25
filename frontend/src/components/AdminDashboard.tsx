import React from 'react';
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
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import Modal from '@mui/material/Modal';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const drawerWidth = 240;

const AdminDashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Users');

  const today = dayjs();
  const minDate = today.startOf('day');

  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs(minDate));
  const [openEdit, setOpenEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenModal = (event: any) => {
    setSelectedEvent(event);
    const selectedDate = dayjs(new Date(event.date));
    setSelectedDate(selectedDate);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleUser = (user: any) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsEditing(true);
    setOpenEdit(true);
  };

  const handleCloseUser = () => setOpenEdit(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  const users = [
    { name: 'Kenjie Balona', role: 'user' },
    { name: 'John Doe', role: 'admin' },
    { name: 'Jane Smith', role: 'user' },
    { name: 'Emily Johnson', role: 'admin' },
    { name: 'Michael Williams', role: 'user' },
    { name: 'Jessica Brown', role: 'admin' },
    { name: 'Daniel Miller', role: 'user' },
    { name: 'Olivia Davis', role: 'admin' },
    { name: 'David Garcia', role: 'user' },
    { name: 'Sophia Martinez', role: 'admin' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin: {auth?.user?.username}
          </Typography>
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
          <List>
            {['Users', 'Events'].map((text, index) => (
              <ListItem
                button
                key={text}
                onClick={() => setActiveSection(text)}
              >
                <ListItemIcon>
                  {index === 0 && <PeopleIcon />}
                  {index === 1 && <EventIcon />}
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
        {activeSection === 'Users' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
            }}
          >
            {users.map((user, index) => (
              <Card
                key={index}
                sx={{
                  minWidth: '300px',
                  margin: '10px',
                  backgroundColor: '#1A1A1A',
                }}
              >
                <CardContent>
                  <Box display={'flex'}>
                    <Avatar />
                    <Typography
                      gutterBottom
                      variant="h5"
                      sx={{ color: 'white', margin: '5px 10px' }}
                    >
                      {user.name}
                    </Typography>
                  </Box>
                  <Box display={'flex'}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ color: 'white', margin: '5px 10px' }}
                    >
                      - {user.role}
                    </Typography>
                    <Button onClick={() => handleUser(user)}>Edit</Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
        {activeSection === 'Events' && (
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
                  <Button size="small" onClick={() => handleOpenModal(event)}>
                    Edit
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        {activeSection === 'Events' && (
          <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                style={{ margin: '5px' }}
              >
                Edit Event: {selectedEvent?.name}
              </Typography>
              <TextField
                variant="outlined"
                label="Name"
                fullWidth
                defaultValue={selectedEvent?.name}
                style={{ margin: '3px' }}
              />
              <TextField
                variant="outlined"
                label="Description"
                fullWidth
                style={{ margin: '3px' }}
                defaultValue={selectedEvent?.description}
              />
              <TextField
                variant="outlined"
                label="Location"
                fullWidth
                style={{ margin: '3px' }}
                defaultValue={selectedEvent?.location}
              />
              {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label="Date"
                  minDate={minDate}
                  value={selectedEvent?.date}
                  onChange={(date) => setSelectedDate(date)}
                />
              </DemoContainer>
            </LocalizationProvider> */}
              <Button
                variant="contained"
                size="large"
                style={{ margin: '8px' }}
              >
                Confirm
              </Button>
            </Box>
          </Modal>
        )}
        {activeSection === 'Users' && (
          <Modal open={openEdit} onClose={handleCloseUser}>
            <Box sx={style}>
              <Typography
                id="modal-modal-title"
                variant="h6"
                component="h2"
                style={{ margin: '5px' }}
              >
                Edit User
              </Typography>
              <TextField
                variant="outlined"
                label="Name"
                fullWidth
                defaultValue={selectedUser?.name}
                style={{ margin: '3px' }}
              />
              <Button
                variant="contained"
                size="large"
                style={{ margin: '8px' }}
              >
                Confirm
              </Button>
              <Button
                variant="contained"
                size="large"
                style={{ margin: '8px' }}
              >
                Delete
              </Button>
            </Box>
          </Modal>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
