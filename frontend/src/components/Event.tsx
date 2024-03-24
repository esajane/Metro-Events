import { Typography, Box, Card, CardContent, Button } from '@mui/material';
import upvote from '../assets/white-upvote-svgrepo-com.svg';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const Event = () => {
  return (
    <Box display={'flex'}>
      <Box sx={{ maxWidth: '800px' }}>
        <Typography variant="h3" sx={{ margin: '5px' }}>
          Event Name
        </Typography>
        <Typography variant="h6" sx={{ margin: '0 15px' }}>
          - Kenjie Gwapo
        </Typography>
        <Typography
          variant="body2"
          color="white"
          sx={{ margin: '5px' }}
          padding="20px"
        >
          description ni diri Lorem ipsum dolor sit amet, consectetur
          adipisicing elit. Debitis nemo molestiae praesentium quas tempora
          cumque minima culpa ipsam eos veritatis architecto, optio delectus eum
          adipisci id tenetur. Voluptas, ea nulla!
        </Typography>
        <Box display={'flex'}>
          <Button>
            <ThumbUpIcon />
          </Button>
          <Typography variant="body2" color="white" sx={{ margin: '10px 0px' }}>
            - 1000
          </Typography>
        </Box>
      </Box>
      <Card sx={{ maxWidth: 345, margin: '10px', backgroundColor: '#1A1A1A' }}>
        <CardContent>
          <Typography gutterBottom variant="h5" sx={{ color: 'white' }}>
            Participants
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ color: 'white' }}
          >
            Joe
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ color: 'white' }}
          >
            Bronx
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ color: 'white' }}
          >
            Esa
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ color: 'white' }}
          >
            Cchan
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Event;
