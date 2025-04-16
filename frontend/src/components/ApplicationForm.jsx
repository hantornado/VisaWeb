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
  Select,
  Stack,
  Heading,
  Text,
  useToast,
  VStack,
  HStack,
  Divider,
  FormHelperText,
  Alert,
  AlertIcon,
  Textarea,
  RadioGroup,
  Radio,
  Checkbox,
  Grid,
  GridItem,
} from '@chakra-ui/react';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    dateOfBirth: '',
    nationality: '',
    visaType: '',
    contactEmail: '',
    contactPhone: '',
    gender: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    purposeOfVisit: '',
    plannedArrivalDate: '',
    plannedDepartureDate: '',
    previousVisits: false,
    previousVisitDetails: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    healthDeclaration: false,
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/applications', formData);
      
      toast({
        title: 'Application Submitted',
        description: `Your application has been submitted successfully. Your unique code is: ${response.data.uniqueCode}. Please save this code for future reference.`,
        status: 'success',
        duration: 10000,
        isClosable: true,
      });

      // Navigate to success page or dashboard
      navigate('/application-success', { 
        state: { 
          uniqueCode: response.data.uniqueCode,
          passportNumber: formData.passportNumber 
        } 
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit application. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl">Visa Application Form</Heading>
          <Text mt={2} color="gray.600">Please fill out all required fields to submit your visa application</Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="md">Personal Information</Heading>
            <Divider />
            
            <FormControl id="fullName" isRequired>
              <FormLabel>Full Name (as in passport)</FormLabel>
              <Input 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </FormControl>

            <FormControl id="gender" isRequired>
              <FormLabel>Gender</FormLabel>
              <RadioGroup name="gender" value={formData.gender} onChange={(value) => setFormData({...formData, gender: value})}>
                <HStack spacing={6}>
                  <Radio value="Male">Male</Radio>
                  <Radio value="Female">Female</Radio>
                  <Radio value="Other">Other</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="dateOfBirth" isRequired>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input 
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="nationality" isRequired>
                  <FormLabel>Nationality</FormLabel>
                  <Input 
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    placeholder="Enter your nationality"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Heading as="h2" size="md" mt={4}>Passport Information</Heading>
            <Divider />

            <FormControl id="passportNumber" isRequired>
              <FormLabel>Passport Number</FormLabel>
              <Input 
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Enter your passport number"
              />
              <FormHelperText>This will be used for login purposes</FormHelperText>
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="passportIssueDate" isRequired>
                  <FormLabel>Passport Issue Date</FormLabel>
                  <Input 
                    name="passportIssueDate"
                    type="date"
                    value={formData.passportIssueDate}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="passportExpiryDate" isRequired>
                  <FormLabel>Passport Expiry Date</FormLabel>
                  <Input 
                    name="passportExpiryDate"
                    type="date"
                    value={formData.passportExpiryDate}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Heading as="h2" size="md" mt={4}>Address Information</Heading>
            <Divider />

            <FormControl id="addressLine1" isRequired>
              <FormLabel>Address Line 1</FormLabel>
              <Input 
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street address, P.O. box, company name"
              />
            </FormControl>

            <FormControl id="addressLine2">
              <FormLabel>Address Line 2</FormLabel>
              <Input 
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="city" isRequired>
                  <FormLabel>City</FormLabel>
                  <Input 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="state">
                  <FormLabel>State/Province</FormLabel>
                  <Input 
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter your state or province"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="postalCode" isRequired>
                  <FormLabel>Postal/Zip Code</FormLabel>
                  <Input 
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Enter your postal code"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="country" isRequired>
                  <FormLabel>Country</FormLabel>
                  <Input 
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter your country"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Heading as="h2" size="md" mt={4}>Visa Information</Heading>
            <Divider />

            <FormControl id="visaType" isRequired>
              <FormLabel>Visa Type</FormLabel>
              <Select 
                name="visaType"
                value={formData.visaType}
                onChange={handleChange}
                placeholder="Select visa type"
              >
                <option value="Tourist">Tourist</option>
                <option value="Business">Business</option>
                <option value="Student">Student</option>
                <option value="Work">Work</option>
                <option value="Family">Family</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            <FormControl id="purposeOfVisit" isRequired>
              <FormLabel>Purpose of Visit</FormLabel>
              <Textarea
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
                placeholder="Please describe the purpose of your visit"
                size="sm"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="plannedArrivalDate" isRequired>
                  <FormLabel>Planned Arrival Date</FormLabel>
                  <Input 
                    name="plannedArrivalDate"
                    type="date"
                    value={formData.plannedArrivalDate}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="plannedDepartureDate" isRequired>
                  <FormLabel>Planned Departure Date</FormLabel>
                  <Input 
                    name="plannedDepartureDate"
                    type="date"
                    value={formData.plannedDepartureDate}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl id="previousVisits">
              <HStack>
                <Checkbox
                  name="previousVisits"
                  isChecked={formData.previousVisits}
                  onChange={handleChange}
                >
                  Have you visited this country before?
                </Checkbox>
              </HStack>
            </FormControl>

            {formData.previousVisits && (
              <FormControl id="previousVisitDetails">
                <FormLabel>Previous Visit Details</FormLabel>
                <Textarea
                  name="previousVisitDetails"
                  value={formData.previousVisitDetails}
                  onChange={handleChange}
                  placeholder="Please provide details of your previous visits (dates, purpose, etc.)"
                  size="sm"
                />
              </FormControl>
            )}

            <Heading as="h2" size="md" mt={4}>Contact Information</Heading>
            <Divider />

            <FormControl id="contactEmail" isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input 
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="Enter your email address"
              />
            </FormControl>

            <FormControl id="contactPhone" isRequired>
              <FormLabel>Phone Number</FormLabel>
              <Input 
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </FormControl>

            <Heading as="h2" size="md" mt={4}>Emergency Contact</Heading>
            <Divider />

            <FormControl id="emergencyContactName" isRequired>
              <FormLabel>Emergency Contact Name</FormLabel>
              <Input 
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="emergencyContactPhone" isRequired>
                  <FormLabel>Emergency Contact Phone</FormLabel>
                  <Input 
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="Enter emergency contact phone"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="emergencyContactRelationship" isRequired>
                  <FormLabel>Relationship</FormLabel>
                  <Input 
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    placeholder="Enter relationship to emergency contact"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Heading as="h2" size="md" mt={4}>Declarations</Heading>
            <Divider />

            <FormControl id="healthDeclaration" isRequired>
              <Checkbox
                name="healthDeclaration"
                isChecked={formData.healthDeclaration}
                onChange={handleChange}
              >
                I declare that I am in good health and have no communicable diseases
              </Checkbox>
            </FormControl>

            <FormControl id="termsAccepted" isRequired>
              <Checkbox
                name="termsAccepted"
                isChecked={formData.termsAccepted}
                onChange={handleChange}
              >
                I agree to the terms and conditions and certify that all information provided is true and accurate
              </Checkbox>
            </FormControl>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              After submission, you will receive a unique code. Keep this code safe as it will be required to check your application status.
            </Alert>

            <Button
              mt={4}
              colorScheme="blue"
              type="submit"
              size="lg"
              width="full"
              isLoading={isSubmitting}
              loadingText="Submitting"
              isDisabled={!formData.termsAccepted}
            >
              Submit Application
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default ApplicationForm;