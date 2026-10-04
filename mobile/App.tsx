import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://beauty-mart-api.onrender.com';
const categories = ['All', 'Skincare', 'Makeup', 'Body Care', 'Lip Care'];
type Product = {
  id: number; name: string; brand: string; description: string;
  price: number; imageUrl: string; category: string; stock: number;
};
type CartItem = { id: number; product: Product; quantity: number; lineTotal: number };
type Cart = { items: CartItem[]; totalItems: number; subtotal: number };
type User = { id: number; email: string; firstName: string; lastName: string | null; profilePictureUrl: string | null };
const money = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;
const imageUri = (path: string) => path.startsWith('/') ? `${API_URL}${path}` : path;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const getSavedToken = () => SecureStore.getItemAsync('beauty-mart-auth-token');
const saveToken = (value: string) => SecureStore.setItemAsync('beauty-mart-auth-token', value);
const clearSavedToken = () => SecureStore.deleteItemAsync('beauty-mart-auth-token');

export type Screen = 'home' | 'shop' | 'cart' | 'account';

export default function App({ screen }: { screen: Screen }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, subtotal: 0 });
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const refreshProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('The catalog could not be loaded. Please try again.');
      setProducts(await response.json());
      setError('');
    } catch {
      setError('Beauty Mart could not connect. Check your internet and try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  const refreshCart = useCallback(async (activeToken: string) => {
    const response = await fetch(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    if (!response.ok) throw new Error('Your shared cart could not be loaded.');
    setCart(await response.json());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- This fetch resolves after network I/O; its state updates reflect the API response.
    void refreshProducts();
  }, [refreshProducts]);
  useEffect(() => {
    let active = true;
    void (async () => {
      const savedToken = await getSavedToken();
      if (!savedToken || !active) return;
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } });
        if (!response.ok) throw new Error('Session expired');
        const currentUser: User = await response.json();
        if (active) { setToken(savedToken); setUser(currentUser); }
      } catch {
        await clearSavedToken();
      }
    })();
    return () => { active = false; };
  }, []);
  // While open, pick up changes made on the website. The backend cart is shared by account.
  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Cart state is refreshed from the API asynchronously.
    void refreshCart(token).catch(() => undefined);
    const timer = setInterval(() => { void refreshCart(token).catch(() => undefined); }, 2500);
    return () => clearInterval(timer);
  }, [token, refreshCart]);

  const visibleProducts = useMemo(
    () => category === 'All' ? products : products.filter((product) => product.category === category),
    [category, products],
  );

  const navigate = (next: Screen) => {
    if (next === 'home') router.push('/');
    else if (next === 'shop') router.push('/shop');
    else if (next === 'cart') router.push('/cart');
    else router.push('/account');
  };

  const addToCart = async (product: Product) => {
    if (!token) {
      Alert.alert('Sign in to add to your cart', 'Sign in with the same Google account you use on the Beauty Mart website.');
      navigate('account');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error('This item could not be added right now.');
      setCart(await response.json());
      Alert.alert('Added to your cart', product.name);
    } catch (requestError) {
      Alert.alert('Cart update failed', requestError instanceof Error ? requestError.message : 'Please try again.');
    }
  };

  const changeQuantity = async (item: CartItem, delta: number) => {
    if (!token) return;
    const nextQuantity = item.quantity + delta;
    try {
      const response = await fetch(`${API_URL}/api/cart/items/${item.id}`, {
        method: nextQuantity === 0 ? 'DELETE' : 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(nextQuantity > 0 ? { body: JSON.stringify({ quantity: nextQuantity }) } : {}),
      });
      if (!response.ok) throw new Error('Your cart could not be updated.');
      setCart(await response.json());
    } catch (requestError) {
      Alert.alert('Cart update failed', requestError instanceof Error ? requestError.message : 'Please try again.');
    }
  };

  const signInWithGoogle = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      Alert.alert('Google sign-in is not configured', 'The app needs the Google web client ID before it can connect your account.');
      return;
    }
    setAuthBusy(true);
    try {
      const googleAuth = await import('@react-native-google-signin/google-signin');
      googleAuth.GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
      });
      await googleAuth.GoogleSignin.hasPlayServices();
      const signInResponse = await googleAuth.GoogleSignin.signIn();
      if (!googleAuth.isSuccessResponse(signInResponse)) return;
      const credential = signInResponse.data.idToken ?? (await googleAuth.GoogleSignin.getTokens()).idToken;
      if (!credential) throw new Error('Google did not return an identity token. Check the mobile OAuth client configuration.');
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message ?? 'Google sign-in could not be verified by Beauty Mart.');
      }
      const authentication = await response.json() as { token: string; user: User };
      await saveToken(authentication.token);
      setToken(authentication.token);
      setUser(authentication.user);
      Alert.alert('Welcome to Beauty Mart', `You are signed in as ${authentication.user.firstName}.`);
    } catch (signInError) {
      const message = signInError instanceof Error ? signInError.message : 'Please try again.';
      const needsBuild = /native module|not linked|not installed|could not be found/i.test(message);
      Alert.alert(needsBuild ? 'Install Beauty Mart' : 'Google sign-in failed', needsBuild
        ? 'Please install the Beauty Mart Android app to sign in with Google.'
        : message);
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    try {
      const googleAuth = await import('@react-native-google-signin/google-signin');
      await googleAuth.GoogleSignin.signOut();
    } catch { /* The app token is still cleared if the native Google module is unavailable. */ }
    await clearSavedToken();
    setToken(null);
    setUser(null);
    setCart({ items: [], totalItems: 0, subtotal: 0 });
  };

  const productCards = (items: Product[]) => (
    <View style={styles.grid}>
      {items.map((product) => (
        <View key={product.id} style={styles.card}>
          <Image source={{ uri: imageUri(product.imageUrl) }} style={styles.productImage} resizeMode="cover" />
          <Text style={styles.cardCategory}>{product.category.toUpperCase()}</Text>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.price}>{money(product.price)}</Text>
          <Pressable onPress={() => void addToCart(product)} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to bag</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );

  const content = screen === 'home' ? (
    <>
      <ImageBackground source={{ uri: 'https://beauty-mart-app.vercel.app/images/beauty-mart-hero.png' }} style={styles.homeHero} imageStyle={styles.homeHeroImage}>
        <View style={styles.homeHeroShade} />
        <View style={styles.homeHeroContent}>
          <Text style={styles.homeHeroEyebrow}>YOUR EVERYDAY BEAUTY EDIT</Text>
          <Text style={styles.homeHeroTitle}>Beauty essentials your routine will love.</Text>
          <Text style={styles.homeHeroCopy}>Discover skincare, makeup, body care, and lip essentials, delivered across Lagos.</Text>
          <Pressable onPress={() => navigate('shop')} style={styles.homeHeroButton}><Text style={styles.homeHeroButtonText}>View products</Text></Pressable>
        </View>
      </ImageBackground>
      <View style={styles.categoryStrip}>
        {categories.slice(1).map((item) => <Pressable key={item} onPress={() => { setCategory(item); navigate('shop'); }}><Text style={styles.categoryStripText}>{item}</Text></Pressable>)}
        <Text style={styles.categoryStripText}>LAGOS DELIVERY</Text>
      </View>
      <View style={styles.homeSection}>
        <Text style={styles.eyebrow}>CURATED WITH INTENTION</Text>
        <Text style={styles.homeSectionTitle}>Make room for a ritual that feels like you.</Text>
        <Text style={styles.body}>Beauty Mart brings everyday favourites into one calm, considered space. Build a routine around what your skin needs and the moments that help you feel your best.</Text>
        <View style={styles.storyImageFrame}><Image source={{ uri: 'https://beauty-mart-app.vercel.app/images/beauty-mart-ritual.png' }} style={styles.storyImage} resizeMode="cover" /></View>
        <View style={styles.promiseList}>
          {['Skincare, makeup, body, and lip essentials', 'A clean shopping experience with no clutter', 'Local delivery within Lagos'].map((item) => <Text key={item} style={styles.promiseLine}>✓  {item}</Text>)}
        </View>
        <Pressable onPress={() => navigate('shop')} style={styles.outlineButton}><Text style={styles.outlineButtonText}>Explore the edit</Text></Pressable>
      </View>
      <View style={styles.homeSection}>
        <Text style={styles.eyebrow}>FROM OUR SHELVES</Text>
        <Text style={styles.homeSectionTitle}>Beauty favourites</Text>
        {busy ? <ActivityIndicator color="#71454a" style={{ marginTop: 30 }} /> : error ? <Pressable onPress={() => { setBusy(true); void refreshProducts(); }} style={styles.empty}><Text style={styles.body}>{error} Tap to retry.</Text></Pressable> : productCards(products.slice(0, 4))}
        <Pressable onPress={() => navigate('shop')} style={styles.outlineButton}><Text style={styles.outlineButtonText}>Shop the collection</Text></Pressable>
      </View>
      <View style={styles.darkCallout}>
        <Text style={styles.eyebrowLight}>THE COMPLETE BEAUTY RITUAL</Text>
        <Text style={styles.calloutTitle}>Your shelf deserves a little everyday luxury.</Text>
        <Text style={styles.calloutCopy}>Start with the essentials, discover something new, and build a collection that works beautifully together.</Text>
        <Pressable onPress={() => navigate('shop')} style={styles.lightButton}><Text style={styles.lightButtonText}>Shop the collection</Text></Pressable>
      </View>
      <View style={styles.homeSection}>
        <Text style={styles.eyebrow}>THE BEAUTY MART PROMISE</Text>
        <Text style={styles.homeSectionTitle}>Simple, personal, and worth coming back to.</Text>
        {[['Carefully selected', 'An intentional edit of beauty products for everyday routines.'], ['Lagos delivery', 'Straightforward local delivery with clear order updates.'], ['Beauty made simple', 'Easy browsing across skincare, makeup, body, and lip care.']].map(([title, copy]) => <View key={title} style={styles.promiseCard}><Text style={styles.promiseTitle}>{title}</Text><Text style={styles.body}>{copy}</Text></View>)}
      </View>
    </>
  ) : screen === 'shop' ? (
    <>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>THE BEAUTY MART EDIT</Text>
        <Text style={styles.heroTitle}>Find your{ '\n' }everyday favourites.</Text>
        <Text style={styles.heroCopy}>Little rituals. Lovely essentials. Delivered within Lagos.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}>
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{category === 'All' ? 'Shop the edit' : category}</Text>
        <Text style={styles.count}>{visibleProducts.length} products</Text>
      </View>
      {busy ? <ActivityIndicator color="#71454a" style={{ marginTop: 44 }} /> : error ? (
        <Pressable onPress={() => { setBusy(true); void refreshProducts(); }} style={styles.empty}><Text style={styles.body}>{error} Tap to retry.</Text></Pressable>
      ) : productCards(visibleProducts)}
    </>
  ) : screen === 'cart' ? (
    <View style={styles.simpleScreen}>
      <Text style={styles.eyebrow}>YOUR BEAUTY MART BAG</Text>
      <Text style={styles.sectionTitle}>Shopping bag</Text>
      {!token ? <><Text style={styles.body}>Sign in with your website account to see your shared cart.</Text><Pressable style={styles.primaryButton} onPress={() => navigate('account')}><Text style={styles.addButtonText}>Continue to sign in</Text></Pressable></> : cart.items.length === 0 ? <Text style={styles.body}>Your bag is waiting for something lovely.</Text> : <>{cart.items.map((item) => <View key={item.id} style={styles.cartRow}><Image source={{ uri: imageUri(item.product.imageUrl) }} style={styles.cartImage} /><View style={{ flex: 1 }}><Text style={styles.productName}>{item.product.name}</Text><Text style={styles.body}>{money(item.product.price)}</Text><View style={styles.quantityControl}><Pressable accessibilityLabel={`Remove one ${item.product.name}`} onPress={() => void changeQuantity(item, -1)} style={styles.quantityButton}><Text style={styles.quantitySymbol}>−</Text></Pressable><Text style={styles.quantity}>{item.quantity}</Text><Pressable accessibilityLabel={`Add one ${item.product.name}`} onPress={() => void changeQuantity(item, 1)} style={styles.quantityButton}><Text style={styles.quantitySymbol}>+</Text></Pressable></View></View><Text style={styles.price}>{money(item.lineTotal)}</Text></View>)}<Text style={styles.subtotal}>Subtotal · {money(cart.subtotal)}</Text></>}
    </View>
  ) : (
    <View style={styles.simpleScreen}>
      <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
      <Text style={styles.sectionTitle}>{user ? `Hello, ${user.firstName}` : 'Welcome to Beauty Mart'}</Text>
      {user ? <><Text style={styles.body}>{user.email}</Text><Pressable style={styles.primaryButton} onPress={() => void signOut()}><Text style={styles.addButtonText}>Sign out</Text></Pressable></> : <>
        <Text style={styles.body}>Use the same Google account as the website so both devices share one cart.</Text>
        <Pressable disabled={authBusy} style={[styles.primaryButton, authBusy && { opacity: 0.65 }]} onPress={() => void signInWithGoogle()}>
          {authBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Continue with Google</Text>}
        </Pressable>
      </>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}><Pressable onPress={() => navigate('home')} style={styles.brandMark}><Text style={styles.brandInitials}>BM</Text></Pressable><Text style={styles.brand}>Beauty Mart</Text><Pressable onPress={() => navigate('cart')} style={styles.bagButton}><Text style={styles.bagText}>BAG {token ? `(${cart.totalItems})` : ''}</Text></Pressable></View>
      <ScrollView key={screen} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>{content}</ScrollView>
      <View style={styles.tabBar}>{(['home', 'shop', 'cart', 'account'] as Screen[]).map((item) => <Pressable key={item} onPress={() => navigate(item)} style={styles.tab}><Text style={[styles.tabLabel, screen === item && styles.tabLabelActive]}>{item === 'home' ? 'HOME' : item === 'shop' ? 'SHOP' : item === 'cart' ? `BAG${token && cart.totalItems ? ` · ${cart.totalItems}` : ''}` : 'ACCOUNT'}</Text></Pressable>)}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fffaf7' },
  header: { height: 62, paddingHorizontal: 22, borderBottomWidth: 1, borderBottomColor: '#eee2dd', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 20, color: '#43272b', fontWeight: '600', letterSpacing: 0.2 },
  brandMark: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f0d8d6', borderWidth: 1, borderColor: '#a77479', alignItems: 'center', justifyContent: 'center' },
  brandInitials: { color: '#553038', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  bagButton: { borderWidth: 1, borderColor: '#dfc9c4', borderRadius: 22, paddingVertical: 9, paddingHorizontal: 15 },
  bagText: { fontSize: 11, fontWeight: '700', color: '#54363b', letterSpacing: 1.1 },
  page: { paddingBottom: 30 },
  homeHero: { minHeight: 485, justifyContent: 'center', backgroundColor: '#6b353b' },
  homeHeroImage: { resizeMode: 'cover' },
  homeHeroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(39,18,22,0.57)' },
  homeHeroContent: { paddingHorizontal: 24, paddingVertical: 45 },
  homeHeroEyebrow: { color: 'rgba(255,255,255,0.82)', fontSize: 10, lineHeight: 16, letterSpacing: 2.4, fontWeight: '700' },
  homeHeroTitle: { color: '#fff', fontSize: 43, lineHeight: 48, letterSpacing: -1.3, fontWeight: '500', marginTop: 20 },
  homeHeroCopy: { color: 'rgba(255,255,255,0.86)', fontSize: 15, lineHeight: 23, marginTop: 19 },
  homeHeroButton: { alignSelf: 'flex-start', minHeight: 46, justifyContent: 'center', paddingHorizontal: 22, marginTop: 26, borderRadius: 25, backgroundColor: '#321b20' },
  homeHeroButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  categoryStrip: { paddingVertical: 18, paddingHorizontal: 19, gap: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: '#fbf6f2', borderBottomWidth: 1, borderBottomColor: '#eadbd6' },
  categoryStripText: { color: '#754d52', fontSize: 9, letterSpacing: 1.1, fontWeight: '700' },
  homeSection: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 32 },
  homeSectionTitle: { color: '#3d2729', fontSize: 30, lineHeight: 35, letterSpacing: -0.6, fontWeight: '500', marginBottom: 9 },
  storyImageFrame: { height: 300, marginTop: 23, borderTopLeftRadius: 100, borderTopRightRadius: 100, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', backgroundColor: '#dfc4b7' },
  storyImage: { width: '100%', height: '100%' },
  promiseList: { gap: 10, marginTop: 22 },
  promiseLine: { color: '#4d3937', fontSize: 13, lineHeight: 20 },
  outlineButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#5a3339', borderRadius: 23, paddingVertical: 12, paddingHorizontal: 18, marginTop: 22 },
  outlineButtonText: { color: '#45262b', fontSize: 12, fontWeight: '600' },
  darkCallout: { marginHorizontal: 13, marginTop: 12, marginBottom: 10, borderRadius: 25, padding: 25, backgroundColor: '#2d171b' },
  eyebrowLight: { color: '#e0b9bb', fontSize: 9, letterSpacing: 1.8, fontWeight: '700' },
  calloutTitle: { color: '#fff', fontSize: 31, lineHeight: 36, letterSpacing: -0.8, marginTop: 16 },
  calloutCopy: { color: 'rgba(255,255,255,0.76)', fontSize: 14, lineHeight: 21, marginTop: 12 },
  lightButton: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 23, paddingVertical: 13, paddingHorizontal: 18, marginTop: 22 },
  lightButtonText: { color: '#321b20', fontSize: 12, fontWeight: '700' },
  promiseCard: { borderWidth: 1, borderColor: '#eadbd6', borderRadius: 20, backgroundColor: '#fbf7f4', padding: 18, marginTop: 12 },
  promiseTitle: { color: '#382427', fontSize: 19, fontWeight: '500' },
  hero: { paddingHorizontal: 24, paddingTop: 35, paddingBottom: 27, backgroundColor: '#f5e8e3' },
  eyebrow: { fontSize: 10, letterSpacing: 2.3, color: '#96686a', fontWeight: '700', marginBottom: 12 },
  heroTitle: { color: '#342124', fontSize: 39, lineHeight: 44, letterSpacing: -1.1, fontWeight: '500' },
  heroCopy: { color: '#715d59', fontSize: 14, lineHeight: 21, marginTop: 12, maxWidth: 290 },
  categories: { gap: 8, paddingHorizontal: 20, paddingVertical: 20 },
  chip: { borderRadius: 24, borderWidth: 1, borderColor: '#e4d4cf', paddingVertical: 9, paddingHorizontal: 14, backgroundColor: '#fffdfb' },
  chipActive: { backgroundColor: '#48282d', borderColor: '#48282d' },
  chipText: { color: '#66514d', fontSize: 12 },
  chipTextActive: { color: 'white' },
  sectionHeading: { paddingHorizontal: 21, paddingTop: 7, paddingBottom: 15, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 28, color: '#382427', fontWeight: '500', letterSpacing: -0.5 },
  count: { color: '#947b74', fontSize: 12 },
  grid: { paddingHorizontal: 17, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 22 },
  card: { width: '48.2%', marginBottom: 3 },
  productImage: { width: '100%', aspectRatio: 0.82, borderRadius: 17, backgroundColor: '#f3eae6' },
  cardCategory: { color: '#987572', fontSize: 9, letterSpacing: 1.35, marginTop: 10 },
  productName: { color: '#392629', fontWeight: '500', fontSize: 15, lineHeight: 20, marginTop: 5 },
  price: { color: '#57383d', fontWeight: '600', fontSize: 14, marginTop: 7 },
  addButton: { borderRadius: 23, backgroundColor: '#48282d', minHeight: 39, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  addButtonText: { color: 'white', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  tabBar: { height: 59, borderTopWidth: 1, borderTopColor: '#eee2dd', backgroundColor: '#fffaf7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tab: { padding: 12 },
  tabLabel: { color: '#a18a84', fontSize: 10, letterSpacing: 1.25, fontWeight: '600' },
  tabLabelActive: { color: '#48282d' },
  simpleScreen: { padding: 24, paddingTop: 37 },
  body: { color: '#796660', fontSize: 14, lineHeight: 22, marginTop: 12 },
  primaryButton: { marginTop: 22, borderRadius: 25, minHeight: 50, backgroundColor: '#48282d', alignItems: 'center', justifyContent: 'center' },
  empty: { padding: 22 },
  cartRow: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee2dd' },
  cartImage: { width: 62, height: 72, borderRadius: 10, backgroundColor: '#f3eae6' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 7 },
  quantityButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#dfc9c4' },
  quantitySymbol: { color: '#48282d', fontSize: 17, lineHeight: 20 },
  quantity: { color: '#48282d', fontSize: 13, fontWeight: '600' },
  subtotal: { alignSelf: 'flex-end', marginTop: 20, color: '#48282d', fontSize: 17, fontWeight: '600' },
});
