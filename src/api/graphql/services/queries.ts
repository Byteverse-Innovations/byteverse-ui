import { graphql } from "../../schema"

export const getIndividualItem = graphql(`
  query getIndividualItem($id: ID!) {
    getIndividualItem(id: $id) {
      category
      createdAt
      description
      isActive
      id
      name
      price
      updatedAt
      estimatedDuration
      pricingModel
      servicePillar
      showOnMainSite
      targetClient
    }
  }
  `
)

export const listAllServices = graphql(`
  query listAllServices {
    listAllServices {
      category
      createdAt
      description
      isActive
      id
      name
      price
      updatedAt
      estimatedDuration
      pricingModel
      servicePillar
      showOnMainSite
      targetClient
    }
  }
`)