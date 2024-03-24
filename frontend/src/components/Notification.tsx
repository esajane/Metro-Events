import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Snackbar from '@mui/joy/Snackbar';

const Notify = ({ isOpen }) => {
  return (
    <Snackbar autoHideDuration={3000} open={isOpen} sx={{ minWidth: 360 }}>
      <Stack spacing={0.5}>
        <Typography level="title-md">Event</Typography>
      </Stack>
    </Snackbar>
  );
};

export default Notify;
