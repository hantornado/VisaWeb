import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUniqueCode, setShowUniqueCode] = useState(false);
  const [formData, setFormData] = useState({
    passportNumber: '',
    uniqueCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      toast({
        title: 'Login Successful',
        description: 'You have successfully logged in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Invalid credentials. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl">Login to Your Account</Heading>
          <Text mt={2} color="gray.600">Enter your passport number and unique code to check your visa application status</Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <VStack spacing={6} align="stretch">
            <FormControl id="passportNumber" isRequired>
              <FormLabel>Passport Number</FormLabel>
              <Input 
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Enter your passport number"
              />
            </FormControl>

            <FormControl id="uniqueCode" isRequired>
              <FormLabel>Unique Code</FormLabel>
              <InputGroup>
                <Input 
                  name="uniqueCode"
                  type={showUniqueCode ? 'text' : 'password'}
                  value={formData.uniqueCode}
                  onChange={handleChange}
                  placeholder="Enter your unique code"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showUniqueCode ? 'Hide unique code' : 'Show unique code'}
                    icon={showUniqueCode ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowUniqueCode(!showUniqueCode)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              The unique code was provided to you when you submitted your visa application.
            </Alert>

            <Button
              mt={4}
              colorScheme="blue"
              type="submit"
              size="lg"
              width="full"
              isLoading={isSubmitting}
              loadingText="Logging in"
            >
              Login
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Login;