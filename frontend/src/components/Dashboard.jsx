import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Submitted':
      return 'blue';
    case 'Under Review':
      return 'orange';
    case 'Additional Documents Required':
      return 'yellow';
    case 'Approved':
      return 'green';
    case 'Rejected':
      return 'red';
    case 'On Hold':
      return 'purple';
    default:
      return 'gray';
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  // Set up axios with auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [navigate]);

  // Fetch user applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('/api/applications/user');
        setApplications(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load your applications. Please try again later.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          toast({
            title: 'Session Expired',
            description: 'Please log in again to continue.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    fetchApplications();

    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(fetchApplications, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8} centerContent>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading your application data...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={() => window.location.reload()} colorScheme="blue">
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justifyContent="space-between">
          <Heading as="h1" size="xl">Application Dashboard</Heading>
          <Button onClick={handleLogout} colorScheme="red" variant="outline">
            Logout
          </Button>
        </HStack>

        {applications.length === 0 ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            You don't have any applications yet. Please submit a new application.
          </Alert>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {applications.map((application) => (
                <Card key={application._id} borderWidth="1px" borderRadius="lg" overflow="hidden">
                  <CardHeader bg="blue.50" pb={2}>
                    <Heading size="md">Application {application.uniqueApplicationCode}</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stat mb={3}>
                      <StatLabel>Current Status</StatLabel>
                      <StatNumber>
                        <Badge colorScheme={getStatusColor(application.status)} fontSize="md" p={1}>
                          {application.status}
                        </Badge>
                      </StatNumber>
                      <StatHelpText>Last updated: {formatDate(application.updatedAt)}</StatHelpText>
                    </Stat>
                    
                    <VStack align="start" spacing={2}>
                      <Text><strong>Visa Type:</strong> {application.visaType}</Text>
                      <Text><strong>Submitted:</strong> {formatDate(application.applicationDate)}</Text>
                    </VStack>
                    
                    <Button 
                      mt={4} 
                      size="sm" 
                      colorScheme="blue" 
                      onClick={() => navigate(`/application/${application._id}`)}
                    >
                      View Details
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            <Box mt={8}>
              <Heading as="h2" size="lg" mb={4}>Status History</Heading>
              <Divider mb={4} />
              
              {applications.length > 0 && (
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Application Code</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                        <Th>Notes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {applications.flatMap(app => 
                        app.statusHistory.map((history, index) => (
                          <Tr key={`${app._id}-${index}`}>
                            <Td>{app.uniqueApplicationCode}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(history.status)}>
                                {history.status}
                              </Badge>
                            </Td>
                            <Td>{formatDate(history.date)}</Td>
                            <Td>{history.notes || '-'}</Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default Dashboard;