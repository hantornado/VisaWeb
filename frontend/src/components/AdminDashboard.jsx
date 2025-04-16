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
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  Flex,
  IconButton,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon, EditIcon } from '@chakra-ui/icons';

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
    default:
      return 'gray';
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State variables
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
  });

  // Check if admin is authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch all applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/applications/admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(response.data.data);
      
      // Calculate stats
      const total = response.data.data.length;
      const approved = response.data.data.filter(app => app.status === 'Approved').length;
      const rejected = response.data.data.filter(app => app.status === 'Rejected').length;
      const pending = total - approved - rejected;
      
      setStats({
        total,
        approved,
        rejected,
        pending,
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications. Please try again.');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch applications',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle application status update
  const handleUpdateStatus = async () => {
    if (!selectedApplication || !updateData.status) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `/api/applications/${selectedApplication._id}/status`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Status updated',
        description: `Application status updated to ${updateData.status}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh applications
      fetchApplications();
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open update modal
  const openUpdateModal = (application) => {
    setSelectedApplication(application);
    setUpdateData({
      status: application.status,
      notes: '',
    });
    onOpen();
  };

  // Filter applications based on search term and status filter
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.uniqueApplicationCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justifyContent="space-between">
          <Heading as="h1" size="xl">
            Admin Dashboard
          </Heading>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>

        <Text fontSize="lg" color="gray.600">
          Manage visa applications and update their status
        </Text>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Applications</StatLabel>
                <StatNumber>{stats.total}</StatNumber>
                <StatHelpText>All time</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending</StatLabel>
                <StatNumber>{stats.pending}</StatNumber>
                <StatHelpText>Awaiting decision</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Approved</StatLabel>
                <StatNumber>{stats.approved}</StatNumber>
                <StatHelpText>Successful applications</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Rejected</StatLabel>
                <StatNumber>{stats.rejected}</StatNumber>
                <StatHelpText>Unsuccessful applications</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Search and Filter */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup flex={1}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, passport number, or application code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            width={{ base: 'full', md: '250px' }}
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Additional Documents Required">Additional Documents Required</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
        </Flex>

        {/* Error Message */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Applications Table */}
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading applications...</Text>
          </Box>
        ) : filteredApplications.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>No applications found.</Text>
          </Box>
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Passport Number</Th>
                  <Th>Application Code</Th>
                  <Th>Visa Type</Th>
                  <Th>Submission Date</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredApplications.map((application) => (
                  <Tr key={application._id}>
                    <Td>{application.fullName}</Td>
                    <Td>{application.passportNumber}</Td>
                    <Td>{application.uniqueApplicationCode}</Td>
                    <Td>{application.visaType}</Td>
                    <Td>{formatDate(application.applicationDate)}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Update status"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => openUpdateModal(application)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>

      {/* Status Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Application Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedApplication && (
              <VStack spacing={4} align="stretch">
                <Text>
                  <strong>Applicant:</strong> {selectedApplication.fullName}
                </Text>
                <Text>
                  <strong>Passport Number:</strong> {selectedApplication.passportNumber}
                </Text>
                <Text>
                  <strong>Current Status:</strong>{' '}
                  <Badge colorScheme={getStatusColor(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </Text>
                <Divider />
                <FormControl isRequired>
                  <FormLabel>New Status</FormLabel>
                  <Select
                    value={updateData.status}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, status: e.target.value })
                    }
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Additional Documents Required">Additional Documents Required</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={updateData.notes}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, notes: e.target.value })
                    }
                    placeholder="Add notes about this status change (optional)"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;