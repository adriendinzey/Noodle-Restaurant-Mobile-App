import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs'
import {useStore} from '../store/store';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import {FlatList} from 'react-native';
import {Dimensions} from 'react-native';
import HeaderBar from '../components/HeaderBar';
import NoodleBowlCard from '../components/NoodleBowlCard';
import CustomIcon from '../components/CustomIcon';


const getCategoriesFromData = (data:any) => {
    let temp: any = {};
    for (let i = 0; i< data.length; i++){
        if(temp[data[i].name] == undefined){
            temp[data[i].name] = 1;
        }
        else{
            temp[data[i].name]++;
        }
    }
    let categories = Object.keys(temp);
    categories.unshift('All');
    return categories
}

const getNoodleBowlList = (category: string, data:any) => {
    if(category == 'All') {
        return data;
    }
    else{
        let noodleBowlList = data.filter((item:any) => item.name == category);
        return noodleBowlList;
    }
}

const HomeScreen = ({navigation}: any) => {
    const NoodleBowlList = useStore((state:any) => state.NoodleBowlList);
    const NoodleTypeList = useStore((state:any) => state.NoodleTypeList);
    const addToCart = useStore((state: any) => state.addToCart);
    const calculateCartPrice = useStore((state: any) => state.calculateCartPrice);
    const [categories,setCategories] = useState(getCategoriesFromData(NoodleBowlList));
    const [searchText,setSearchText] = useState('');
    const [categoryIndex,setCategoryIndex] = useState({
        index: 0,
        categoryIndex: categories[0],
    });
    const [sortedNoodleBowls, setSortedNoodleBowls] = useState(getNoodleBowlList(categoryIndex.category, NoodleBowlList));

    const tabBarHeight = useBottomTabBarHeight();
    const ListRef: any = useRef<FlatList>();

    const searchNoodleBowls = (search: string) => {
    if (search != '') {
      ListRef?.current?.scrollToOffset({
        animated: true,
        offset: 0,
      });
      setCategoryIndex({index: 0, category: categories[0]});
      setSortedNoodleBowls([
        ...NoodleBowlList.filter((item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        ),
      ]);
    }
    };

    const resetSearchNoodleBowls = () => {
    ListRef?.current?.scrollToOffset({
      animated: true,
      offset: 0,
    });
    setCategoryIndex({index: 0, category: categories[0]});
    setSortedNoodleBowls([...NoodleBowlList]);
    setSearchText('');
    };

    const NoodleBowlsCardAddToCart = ({
    id,
    index,
    name,
    spice,
    imagelink_square,
    special_ingredient,
    type,
    prices,
    }: any) => {
    addToCart({
      id,
      index,
      name,
      spice,
      imagelink_square,
      special_ingredient,
      type,
      prices,
    });
    calculateCartPrice();
    ToastAndroid.showWithGravity(
      `${name} is Added to Cart`,
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
    };

    useEffect(() => {
    setSortedNoodleBowls([...getNoodleBowlList(categories[0], NoodleBowlList)]);
    }, []);

    return (
        <View style={styles.ScreenContainer}>
            <StatusBar backgroundColor={COLORS.primaryBlackHex} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.ScrollViewFlex}>
                <HeaderBar />

                <Text style={styles.ScreenTitle}>
                    Pick your toppings and your noodle type.
                </Text>
                <View style={styles.InputContainerComponent}>
                  <TouchableOpacity
                    onPress={() => {
                      searchNoodleBowls(searchText);
                    }}>
                    <CustomIcon
                      style={styles.InputIcon}
                      name="search"
                      size={FONTSIZE.size_18}
                      color={
                        searchText.length > 0
                          ? COLORS.primaryOrangeHex
                          : COLORS.primaryLightGreyHex
                      }
                    />
                  </TouchableOpacity>
                  <TextInput
                    placeholder="Find Your Bowl..."
                    value={searchText}
                    onChangeText={text => {
                      setSearchText(text);
                      searchNoodleBowls(text);
                    }}
                    placeholderTextColor={COLORS.primaryLightGreyHex}
                    style={styles.TextInputContainer}
                  />
                  {searchText.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => {
                        resetSearchNoodleBowls();
                      }}>
                      <CustomIcon
                        style={styles.InputIcon}
                        name="close"
                        size={FONTSIZE.size_16}
                        color={COLORS.primaryLightGreyHex}
                      />
                    </TouchableOpacity>
                  ) : (
                    <></>
                  )}
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.CategoryScrollViewStyle}>
                    {categories.map((data, index) => (
                    <View
                      key={index.toString()}
                      style={styles.CategoryScrollViewContainer}>
                      <TouchableOpacity
                        style={styles.CategoryScrollViewItem}
                        onPress={() => {
                          ListRef?.current?.scrollToOffset({
                            animated: true,
                            offset: 0,
                          });
                          setCategoryIndex({index: index, category: categories[index]});
                          setSortedNoodleBowls([
                            ...getNoodleBowlList(categories[index], NoodleBowlList),
                          ]);
                        }}>
                        <Text
                          style={[
                            styles.CategoryText,
                            categoryIndex.index == index
                              ? {color: COLORS.primaryOrangeHex}
                              : {},
                          ]}>
                          {data}
                        </Text>
                        {categoryIndex.index == index ? (
                          <View style={styles.ActiveCategory} />
                        ) : (
                          <></>
                        )}
                      </TouchableOpacity>
                    </View>
                    ))}
                    </ScrollView>

                    <FlatList
                    ref={ListRef}
                    horizontal
                    ListEmptyComponent={
                    <View style={styles.EmptyListContainer}>
                      <Text style={styles.CategoryText}>No Noodle Bowls Available</Text>
                    </View>
                    }
                    showsHorizontalScrollIndicator={false}
                    data={sortedNoodleBowls}
                    contentContainerStyle={styles.FlatListContainer}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.push('Details', {
                            index: item.index,
                            id: item.id,
                            type: item.type,
                          });
                        }}>
                        <NoodleBowlCard
                          id={item.id}
                          index={item.index}
                          type={item.type}
                          spice={item.spice}
                          imagelink_square={item.imagelink_square+5}
                          name={item.name}
                          special_ingredient={item.special_ingredient}
                          average_rating={item.average_rating}
                          price={item.prices[2]}
                          buttonPressHandler={NoodleBowlsCardAddToCart}
                        />
                      </TouchableOpacity>
                    );
                    }}
                    />

                    <Text style={styles.NoodleTypeTitle}>Noodle Types</Text>


                    <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={NoodleTypeList}
                    contentContainerStyle={[
                    styles.FlatListContainer,
                    {marginBottom: tabBarHeight},
                    ]}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.push('Details', {
                            index: item.index,
                            id: item.id,
                            type: item.type,
                          });
                        }}>
                        <NoodleBowlCard
                          id={item.id}
                          index={item.index}
                          type={item.type}
                          spice={item.spice}
                          imagelink_square={item.imagelink_square+5}
                          name={item.name}
                          special_ingredient={item.special_ingredient}
                          average_rating={item.average_rating}
                          price={item.prices[2]}
                          buttonPressHandler={NoodleBowlsCardAddToCart}
                        />
                      </TouchableOpacity>
                    );
                    }}
                    />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  ScrollViewFlex: {
    flexGrow: 1,
  },
  ScreenTitle: {
    fontSize: FONTSIZE.size_28,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
    paddingLeft: SPACING.space_30,
  },
    InputContainerComponent: {
      flexDirection: 'row',
      margin: SPACING.space_30,
      borderRadius: BORDERRADIUS.radius_20,
      backgroundColor: COLORS.primaryDarkGreyHex,
      alignItems: 'center',
    },
    InputIcon: {
      marginHorizontal: SPACING.space_20,
    },
    TextInputContainer: {
      flex: 1,
      height: SPACING.space_20 * 3,
      fontFamily: FONTFAMILY.poppins_medium,
      fontSize: FONTSIZE.size_14,
      color: COLORS.primaryWhiteHex,
    },
    CategoryScrollViewStyle: {
      paddingHorizontal: SPACING.space_20,
      marginBottom: SPACING.space_20,
    },
    CategoryScrollViewContainer: {
      paddingHorizontal: SPACING.space_15,
    },
    CategoryScrollViewItem: {
      alignItems: 'center',
    },
    CategoryText: {
      fontFamily: FONTFAMILY.poppins_semibold,
      fontSize: FONTSIZE.size_16,
      color: COLORS.primaryLightGreyHex,
      marginBottom: SPACING.space_4,
    },
    ActiveCategory: {
      height: SPACING.space_10,
      width: SPACING.space_10,
      borderRadius: BORDERRADIUS.radius_10,
      backgroundColor: COLORS.primaryOrangeHex,
    },
    FlatListContainer: {
      gap: SPACING.space_20,
      paddingVertical: SPACING.space_20,
      paddingHorizontal: SPACING.space_30,
    },
    EmptyListContainer: {
      width: Dimensions.get('window').width - SPACING.space_30 * 2,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.space_36 * 3.6,
    },
    NoodleTypeTile: {
      fontSize: FONTSIZE.size_18,
      marginLeft: SPACING.space_30,
      marginTop: SPACING.space_20,
      fontFamily: FONTFAMILY.poppins_medium,
      color: COLORS.secondaryLightGreyHex,
    },
});

export default HomeScreen;