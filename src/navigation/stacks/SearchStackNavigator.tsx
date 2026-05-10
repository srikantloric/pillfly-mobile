import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '../../types/navigation.types';
import { SearchHomeScreen, SearchResultsScreen } from '../../screens/search';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export function SearchStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SearchHome" component={SearchHomeScreen} options={{ title: 'Search' }} />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Results' }}
      />
    </Stack.Navigator>
  );
}
