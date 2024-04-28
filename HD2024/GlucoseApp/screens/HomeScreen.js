import {ref, onValue, getDatabase } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { db } from "../firebase";

const HomeScreen = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const checkValue = ref(db, 'epochs/' + epoch + '/on');
    onValue(checkValue, (snapshot) => {
        const dataa = snapshot.val(); 
        setData(dataa);
    })

  })

/*
    const data = [
    { quarter: 1, earnings: 13000 },
    { quarter: 2, earnings: 16500 },
    { quarter: 3, earnings: 14250 },
    { quarter: 4, earnings: 19000 },
  ];

  */

  /*
    <View style={styles.container}>
        <VictoryChart width={350} theme={VictoryTheme.material}>
          <VictoryBar data={data} x="quarter" y="earnings" />
        </VictoryChart>
      </View>
      */

  return (
    <View>
      <Text>"Loading" : {data}</Text>
    </View>
  );
};

export default HomeScreen;
