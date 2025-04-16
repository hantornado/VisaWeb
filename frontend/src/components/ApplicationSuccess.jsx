import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  useClipboard,
  Code,
} from '@chakra-ui/react';

const ApplicationSuccess = () => {
  const location = useLocation();
  const { uniqueCode, passportNumber } = location.state || {};
  const { hasCopied, onCopy } = useClipboard(uniqueCode || '');

  // If no uniqueCode is provided, show an error
  if (!uniqueCode) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>No application data found. Please submit an application first.</AlertDescription>
        </Alert>
        <Button as={Link} to="/" mt={4} colorScheme="blue">
          Go to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="lg">Application Submitted Successfully!</AlertTitle>
            <AlertDescription>
              Your visa application has been received and is now being processed.
            </AlertDescription>
          </Box>
        </Alert>

        <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Application Details
            </Heading>
            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>Your Unique Code:</Text>
              <HStack>
                <Code p={3} borderRadius="md" fontSize="lg" flex="1">
                  {uniqueCode}
                </Code>
                <Button onClick={onCopy} colorScheme="blue">
                  {hasCopied ? 'Copied!' : 'Copy'}
                </Button>
              </HStack>
              <Text mt={2} color="red.500" fontWeight="semibold">
                IMPORTANT: Save this code! You will need it to check your application status.
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>Passport Number:</Text>
              <Code p={3} borderRadius="md" fontSize="lg" display="block">
                {passportNumber}
              </Code>
            </Box>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>What's Next?</AlertTitle>
                <AlertDescription>
                  <Text>1. You will receive updates about your application status.</Text>
                  <Text>2. To check your status, use your passport number and unique code to log in.</Text>
                  <Text>3. Keep your unique code safe and confidential.</Text>
                </AlertDescription>
              </Box>
            </Alert>

            <HStack spacing={4} justify="center" pt={4}>
              <Button as={Link} to="/login" colorScheme="blue">
                Go to Login
              </Button>
              <Button as={Link} to="/" variant="outline">
                Return to Home
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default ApplicationSuccess;