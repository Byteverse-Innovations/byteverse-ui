import { graphql } from "../../schema"

export const submitContactForm = graphql(`
  mutation submitContactForm($input: ContactFormInput!) {
    submitContactForm(input: $input) {
      success
      message
    }
  }
`)