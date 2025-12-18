/* eslint-disable @typescript-eslint/no-explicit-any */

import { APIRequestContext, request } from "@playwright/test"


const getRequest = async (url: string, headers?: Record<string, string>, body?: any, availableRequest?: APIRequestContext) => {
  const requestOptions = {
    data: body,
    headers: headers || undefined,
  };

  const requestContext = availableRequest || (await request.newContext());
  const shouldDispose = !availableRequest;
  
  try {
    const response = await requestContext.get(url, requestOptions);
    return response;
  } finally {
    if (shouldDispose) {
      await requestContext.dispose();
    }
  }
};

const postRequest = async (url: string, body?: any, availableRequest?: APIRequestContext, headers?: Record<string, string>) => {
  const requestOptions = {
    data: body,
    headers: headers || undefined,
  };

  const requestContext = availableRequest || (await request.newContext());
  const shouldDispose = !availableRequest;
  
  try {
    const response = await requestContext.post(url, requestOptions);
    return response;
  } finally {
    if (shouldDispose) {
      await requestContext.dispose();
    }
  }
};

const deleteRequest = async (url: string, headers?: Record<string, string>, body?: any, availableRequest?: APIRequestContext) => {
  const requestOptions = {
    data: body,
    headers: headers || undefined,
  };

  const requestContext = availableRequest || (await request.newContext());
  const shouldDispose = !availableRequest;
  
  try {
    const response = await requestContext.delete(url, requestOptions);
    return response;
  } finally {
    if (shouldDispose) {
      await requestContext.dispose();
    }
  }
};

const patchRequest = async (url: string, body?: any, availableRequest?: APIRequestContext, headers?: Record<string, string>) => {
  const requestOptions = {
    data: body,
    headers: headers || undefined,
  };

  const requestContext = availableRequest || (await request.newContext());
  const shouldDispose = !availableRequest;
  
  try {
    const response = await requestContext.patch(url, requestOptions);
    return response;
  } finally {
    if (shouldDispose) {
      await requestContext.dispose();
    }
  }
};

export { getRequest, deleteRequest, postRequest, patchRequest }