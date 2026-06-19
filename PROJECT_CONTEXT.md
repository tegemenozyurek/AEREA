# AEREA — Proje Bağlamı & Oturum Notları

> Yeni chat açtığında bu dosyayı `@PROJECT_CONTEXT.md` ile referans ver. Son güncelleme: Haziran 2025.

## Stack

- **Expo SDK 54** · React Native 0.81.5 · React 19
- **Firebase Auth** (giriş); forum **mock/local** (henüz backend yok)
- **expo-blur**, **expo-linear-gradient**, **expo-image-picker**
- **react-native-draggable-flatlist** + **react-native-gesture-handler** + **reanimated**
- **patch-package**: `postinstall` → `patches/react-native-draggable-flatlist+4.0.3.patch`

## Uygulama Yapısı

```
App.tsx
├── GradientBackground (global)
├── AuthProvider · NavigationProvider · CommunityProvider
├── NavBar (5 tab: Home, Machines, Analysis, Community, Profile)
└── CurrentScreen → route'a göre ekran
```

| Tab | Ekran |
|-----|--------|
| home | HomeScreen |
| machines | MachinesScreen |
| analysis | AnalysisScreen |
| community | CommunityScreen |
| account | AccountScreen |

---

## Community / Forum

### Erişim
Community tab → `CommunityScreen.tsx` (başlık: **"Forum"**)

### Veri & state
- `types/community.ts` — `CommunityPost`, `CommunityComment` (`replies?` ile iç içe yorum), `CommunityTopic`: `'Question' | 'Advice' | 'My Experience'`
- `data/mockCommunityPosts.ts` — 16+ mock post; `post-1` ve `post-3` nested reply örnekleri
- `contexts/CommunityContext.tsx` — posts, hot/latest, like, comment, create, refresh, `commentsPostId` / openComments / closeComments
- `utils/comments.ts` — `countComments`, `cloneComments`, `addReplyToComment`

### UI tercihleri (kullanıcı kararları)
- Reddit branding yok (`r/` yok); topic renkli badge
- Upvote/downvote **yok** — Instagram tarzı kalp
- Yorumlar **modal/sheet değil** — ayrı sayfa `PostCommentsScreen`
- Post oluşturma: sadece header **+** butonu (`CreatePostModal`); "Create a post..." bar **kaldırıldı**
- Feed tam genişlik; postlar arası **çizgi yok**, ~8px boşluk
- Liquid glass kartlar (`GlassCard` + koyu overlay)
- Action bar: Instagram stili — ikonlar **solda**, sayılar altta değil yanlarında (kompakt hit area)
- Çoklu fotoğraf: `PhotoCarousel` — yatay slider + nokta göstergeleri
- Fotoğraflı postlarda başlık/foto/metin arası `photoPostStyles.block` gap (~20px)
- Yorum thread: `CommentItem` — çizgi + nokta izdüşümü (nested replies)

### Önemli dosyalar
| Dosya | Rol |
|-------|-----|
| `screens/CommunityScreen.tsx` | Feed, Hot/New, SectionList, + FAB |
| `screens/PostCommentsScreen.tsx` | Yorum sayfası, reply banner |
| `components/GlassCard.tsx` | Blur + koyu cam efekti |
| `components/CommunityPostCard.tsx` | GlassCard wrapper, photo/no-photo routing |
| `components/CommunityPostWithPhoto.tsx` | Fotoğraflı layout |
| `components/CommunityPostNoPhoto.tsx` | Metin layout |
| `components/PhotoCarousel.tsx` | Slider + dots |
| `components/PostActionBar.tsx` | Like / comment / share (solda) |
| `components/LikeControls.tsx` | Kalp toggle |
| `components/CommentItem.tsx` | Recursive yorum + thread çizgileri |
| `components/CreatePostModal.tsx` | Yeni post (topic, title, body, photos) |
| `components/communityPostShared.tsx` | FORUM tokens, PostMeta, TopicBadge, stiller |

### API (CommunityContext)
```ts
toggleLike(postId)
addComment(postId, body, parentCommentId?)  // parentCommentId = nested reply
createPost(input)
openComments(postId) / closeComments()
countComments(comments)  // tüm reply'ları sayar
```

---

## Machines

### Ekran
`screens/MachinesScreen.tsx` — Room listesi, `NestableScrollContainer` ile scroll

### Room & makine
- `components/RoomSection.tsx` — expand/collapse room, makine listesi
- `components/MachineCard.tsx` — ppm/pH/su, expand detay, **2 sn long press → drag**
- `data/mockMachines.ts` — MOCK_ROOMS
- `screens/MachineDetailScreen.tsx` — detay, room taşıma, rename

### Sürükle-bırak & scroll (kritik)
- **NestableScrollContainer** (parent scroll) + **NestableDraggableFlatList** (room içi liste)
- Mod geçişi **yok** — tek liste, yerinde long press + sürükle
- `DRAG_HOLD_MS = 2000` (MachineCard + RoomSection)
- Drag sırasında outer scroll otomatik kapanır (nestable context)

### measureLayout patch
RN 0.81'de `ref.measureLayout` uyarısı veriyordu. Patch:
- `UIManager.measureLayout` + `findNodeHandle` kullanımı
- Dosya: `patches/react-native-draggable-flatlist+4.0.3.patch`
- `npm install` sonrası otomatik uygulanır

---

## Ortak UI

- **GradientBackground** — tüm ekranlar arkasında gradient
- **NavBar** — `expo-blur`, `tint="dark"`, 5 tab
- **useResponsive** — tablet/telefon padding, scale
- Header stili: ortada beyaz başlık, sağda ikon butonları (glass pill)

---

## Git

- Remote: `https://github.com/tegemenozyurek/AEREA.git`
- Forum geliştirmesi için **`forum`** branch kullanıldı
- Branch geçiş: `git fetch origin` → `git checkout forum`
- İlk push: `git push -u origin forum`

---

## Bilinen tip kuralları

- `CommunityTopic` sadece: `'Question' | 'Advice' | 'My Experience'` — mock'ta `'Test'` kullanma
- `DraggableFlatList` **default export** (named değil):
  ```ts
  import DraggableFlatList, { NestableDraggableFlatList, ... } from 'react-native-draggable-flatlist';
  ```

---

## Yapılmadı / bilinçli erteleme

- Forum search (stub Alert)
- Add machine / Add room butonları (onPress boş)
- Firebase forum backend
- PR oluşturulmadı (kullanıcı istemedi)

---

## Hızlı test noktaları

| Özellik | Nerede test |
|---------|-------------|
| 2+ fotoğraf slider | `post-3`, `post-6` |
| Nested yorumlar | `post-1` |
| 123k like gösterimi | `post-test-123456` (mock) |
| Makine drag | Machines → 2 sn basılı tut → sürükle |
| Sayfa scroll (machines) | Kart üzerinde dikey kaydır |

---

## Yeni chat prompt önerisi

```
@PROJECT_CONTEXT.md dosyasını oku. AEREA Expo projesinde [görevin] ...
```
