const getUniqueId = ():string => {
    const value = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let generatedId = '';
    
    for (let i = 0; i < 24; i++) {
      const randomIndex = Math.floor(Math.random() * value.length);
      generatedId += value[randomIndex];
    }
    
    return generatedId;
  };

  export default getUniqueId