import 'package:flutter/material.dart';

void main() {
  runApp(const PocketPaletteApp());
}

class PocketPaletteApp extends StatelessWidget {
  const PocketPaletteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pocket Palette',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const AppShell(),
    );
  }
}

class AppColors {
  static const surface = Color(0xfffff8f4);
  static const surfaceContainerLowest = Color(0xffffffff);
  static const surfaceContainerLow = Color(0xfffff1e7);
  static const surfaceContainer = Color(0xfffcebdd);
  static const surfaceContainerHigh = Color(0xfff6e5d7);
  static const surfaceVariant = Color(0xfff0e0d2);
  static const onSurface = Color(0xff221a12);
  static const onSurfaceVariant = Color(0xff544434);
  static const outline = Color(0xff877462);
  static const outlineVariant = Color(0xffdac2ae);
  static const primary = Color(0xff895100);
  static const primaryContainer = Color(0xffff9f1c);
  static const onPrimaryContainer = Color(0xff683c00);
  static const secondaryContainer = Color(0xfffdbd68);
  static const tertiary = Color(0xff006686);
  static const tertiaryContainer = Color(0xff00c3fd);
}

class AppTheme {
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.surface,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryContainer,
        brightness: Brightness.light,
        primary: AppColors.primary,
        surface: AppColors.surface,
      ),
      fontFamily: 'Inter',
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 30,
          height: 38 / 30,
          fontWeight: FontWeight.w700,
          color: AppColors.onSurface,
        ),
        headlineMedium: TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 22,
          height: 28 / 22,
          fontWeight: FontWeight.w600,
          color: AppColors.onSurface,
        ),
        titleMedium: TextStyle(
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 18,
          height: 24 / 18,
          fontWeight: FontWeight.w600,
          color: AppColors.onSurface,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          height: 24 / 16,
          color: AppColors.onSurface,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          height: 20 / 14,
          color: AppColors.onSurface,
        ),
        labelSmall: TextStyle(
          fontSize: 12,
          height: 16 / 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.6,
          color: AppColors.onSurfaceVariant,
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        border: UnderlineInputBorder(
          borderSide: BorderSide(color: AppColors.outlineVariant, width: 2),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: AppColors.primaryContainer, width: 2),
        ),
      ),
    );
  }
}

class Restaurant {
  const Restaurant({
    required this.name,
    required this.category,
    required this.area,
    required this.status,
    required this.imageUrl,
    required this.icon,
    this.rating,
    this.distance,
    this.favorite = false,
  });

  final String name;
  final String category;
  final String area;
  final String status;
  final String imageUrl;
  final IconData icon;
  final double? rating;
  final String? distance;
  final bool favorite;
}

const restaurants = [
  Restaurant(
    name: 'Omakase Room',
    category: 'Japanese',
    area: 'West Village',
    status: 'Want to Go',
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80',
    icon: Icons.set_meal,
    rating: 4.8,
    favorite: true,
  ),
  Restaurant(
    name: "L'Artusi",
    category: 'Italian',
    area: 'West Village',
    status: 'Visited',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
    icon: Icons.local_dining,
    rating: 4.7,
  ),
  Restaurant(
    name: 'La Cabra',
    category: 'Bakery',
    area: 'East Village',
    status: 'Visited',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    icon: Icons.bakery_dining,
    rating: 4.9,
    favorite: true,
  ),
];

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomePage(onShareImport: () => _openShareImport(context)),
      const ListPage(),
      const MapPage(),
      AddPage(onShareImport: () => _openShareImport(context)),
      const ProfilePage(),
    ];

    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primaryContainer.withOpacity(0.18),
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.format_list_bulleted), label: 'List'),
          NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map), label: 'Map'),
          NavigationDestination(icon: Icon(Icons.add_circle_outline), label: 'Add'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }

  void _openShareImport(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const ShareImportPage(
          initialText: '台北近期最想二訪的義式小餐館：Osteria Bianca\n招牌是松露手工寬麵，晚餐建議先訂位。\nhttps://www.instagram.com/reel/C8FoodieMap/',
        ),
      ),
    );
  }
}

class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({super.key, this.title = 'Pocket Palette', this.trailing = Icons.search});

  final String title;
  final IconData trailing;

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.surface,
      elevation: 1,
      shadowColor: Colors.black.withOpacity(0.12),
      centerTitle: true,
      leading: IconButton(
        onPressed: () {},
        icon: const Icon(Icons.restaurant_menu, color: AppColors.primary),
      ),
      title: Text(title, style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: AppColors.primary)),
      actions: [
        IconButton(
          onPressed: () {},
          icon: Icon(trailing, color: AppColors.primary),
        ),
      ],
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key, required this.onShareImport});

  final VoidCallback onShareImport;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
        children: [
          Text('Good morning, Foodie', style: Theme.of(context).textTheme.displayLarge),
          const SizedBox(height: 4),
          Text('What are you craving today?', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.onSurfaceVariant)),
          const SizedBox(height: 16),
          const SearchField(hint: 'Search areas or cuisines...'),
          const SizedBox(height: 20),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: const [
              CategoryChip(icon: Icons.local_cafe, label: 'Coffee'),
              CategoryChip(icon: Icons.ramen_dining, label: 'Hotpot'),
              CategoryChip(icon: Icons.egg_alt, label: 'Brunch'),
              CategoryChip(icon: Icons.bakery_dining, label: 'Bakery'),
            ],
          ),
          const SizedBox(height: 28),
          ImportBanner(onTap: onShareImport),
          const SizedBox(height: 28),
          SectionHeader(title: 'Recently Added', action: 'See all'),
          const SizedBox(height: 12),
          SizedBox(
            height: 282,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: restaurants.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (_, index) => FeaturedRestaurantCard(restaurant: restaurants[index]),
            ),
          ),
          const SizedBox(height: 28),
          Text('Curated Collections', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          const CollectionGrid(),
        ],
      ),
    );
  }
}

class SearchField extends StatelessWidget {
  const SearchField({super.key, required this.hint});

  final String hint;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        boxShadow: cardShadow,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          const Icon(Icons.search, color: AppColors.outline),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              decoration: InputDecoration.collapsed(hintText: hint),
            ),
          ),
        ],
      ),
    );
  }
}

class CategoryChip extends StatelessWidget {
  const CategoryChip({super.key, required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      avatar: Icon(icon, size: 18, color: AppColors.onSurface),
      label: Text(label.toUpperCase(), style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.onSurface)),
      backgroundColor: AppColors.primaryContainer.withOpacity(0.15),
      side: BorderSide.none,
      onPressed: () {},
    );
  }
}

class ImportBanner extends StatelessWidget {
  const ImportBanner({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceContainerLowest,
      borderRadius: BorderRadius.circular(20),
      elevation: 0,
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primaryContainer.withOpacity(0.35)),
            boxShadow: cardShadow,
            color: AppColors.surfaceContainerLowest,
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.ios_share, color: AppColors.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Import from IG or Threads', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text('Parse a shared post into a restaurant draft.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.onSurfaceVariant)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.outline),
            ],
          ),
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, required this.action});

  final String title;
  final String action;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        Text(action, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.primary, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class FeaturedRestaurantCard extends StatelessWidget {
  const FeaturedRestaurantCard({super.key, required this.restaurant});

  final Restaurant restaurant;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 290,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(20),
          boxShadow: cardShadow,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Image.network(restaurant.imageUrl, width: double.infinity, height: 178, fit: BoxFit.cover),
                Positioned(
                  right: 12,
                  top: 12,
                  child: CircleAvatar(
                    backgroundColor: Colors.white.withOpacity(0.88),
                    child: Icon(restaurant.favorite ? Icons.bookmark : Icons.bookmark_border, color: AppColors.onSurface),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(restaurant.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.headlineMedium),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 16, color: AppColors.primaryContainer),
                      Text(' ${restaurant.rating?.toStringAsFixed(1) ?? '-'}', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                      const Text(' / ', style: TextStyle(color: AppColors.outlineVariant)),
                      Flexible(
                        child: Text(
                          restaurant.area,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.onSurfaceVariant),
                        ),
                      ),
                      const Text(' / ', style: TextStyle(color: AppColors.outlineVariant)),
                      Flexible(
                        child: Text(
                          restaurant.category,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.onSurfaceVariant),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CollectionGrid extends StatelessWidget {
  const CollectionGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 190,
      child: Row(
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network('https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80', fit: BoxFit.cover),
                  Container(color: Colors.black.withOpacity(0.28)),
                  Positioned(
                    left: 16,
                    bottom: 16,
                    child: Text('Date Night', style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              children: const [
                Expanded(child: CollectionTile(icon: Icons.local_pizza, label: 'Late Night', color: AppColors.secondaryContainer)),
                SizedBox(height: 16),
                Expanded(child: CollectionTile(icon: Icons.eco, label: 'Vegan Eats', color: AppColors.tertiaryContainer)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class CollectionTile extends StatelessWidget {
  const CollectionTile({super.key, required this.icon, required this.label, required this.color});

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.18),
        borderRadius: BorderRadius.circular(20),
        boxShadow: cardShadow,
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: AppColors.onSurface, size: 28),
            const SizedBox(height: 4),
            Text(label.toUpperCase(), style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.onSurface)),
          ],
        ),
      ),
    );
  }
}

class ListPage extends StatelessWidget {
  const ListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: const [
                StatusChip(label: 'All', selected: true),
                StatusChip(label: 'Want to Go'),
                StatusChip(label: 'Visited'),
                StatusChip(label: 'Favorites'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          for (final restaurant in restaurants) ...[
            RestaurantListTile(restaurant: restaurant),
            const SizedBox(height: 14),
          ],
        ],
      ),
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip({super.key, required this.label, this.selected = false});

  final String label;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        selected: selected,
        label: Text(label),
        selectedColor: AppColors.primaryContainer,
        backgroundColor: AppColors.surfaceContainerLowest,
        side: const BorderSide(color: AppColors.outlineVariant),
        onSelected: (_) {},
      ),
    );
  }
}

class RestaurantListTile extends StatelessWidget {
  const RestaurantListTile({super.key, required this.restaurant});

  final Restaurant restaurant;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
        boxShadow: cardShadow,
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Image.network(restaurant.imageUrl, width: 100, height: 100, fit: BoxFit.cover),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(restaurant.name, style: Theme.of(context).textTheme.titleMedium, overflow: TextOverflow.ellipsis)),
                    Icon(restaurant.favorite ? Icons.favorite : Icons.favorite_border, color: restaurant.favorite ? AppColors.primary : AppColors.onSurfaceVariant),
                  ],
                ),
                const SizedBox(height: 6),
                Text('${restaurant.category} • ${restaurant.area}', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.onSurfaceVariant)),
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: restaurant.status == 'Want to Go' ? AppColors.primaryContainer.withOpacity(0.2) : AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(restaurant.status.toUpperCase(), style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 10)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class MapPage extends StatelessWidget {
  const MapPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.network('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80', fit: BoxFit.cover, color: AppColors.surfaceVariant.withOpacity(0.7), colorBlendMode: BlendMode.screen),
          ),
          Positioned(
            top: 20,
            left: 20,
            right: 20,
            child: const SearchField(hint: 'Search this area...'),
          ),
          const Positioned(top: 170, left: 78, child: MapPin(icon: Icons.ramen_dining)),
          const Positioned(top: 265, right: 92, child: MapPin(icon: Icons.bakery_dining, active: true)),
          const Positioned(top: 380, left: 128, child: MapPin(icon: Icons.local_cafe)),
          Positioned(
            right: 20,
            bottom: 190,
            child: FloatingActionButton.small(
              backgroundColor: AppColors.surface,
              foregroundColor: AppColors.primary,
              onPressed: () {},
              child: const Icon(Icons.my_location),
            ),
          ),
          Positioned(
            left: 20,
            right: 20,
            bottom: 24,
            child: MapPreviewCard(restaurant: restaurants[2]),
          ),
        ],
      ),
    );
  }
}

class MapPin extends StatelessWidget {
  const MapPin({super.key, required this.icon, this.active = false});

  final IconData icon;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: active ? 48 : 40,
          height: active ? 48 : 40,
          decoration: BoxDecoration(
            color: active ? AppColors.primary : AppColors.primaryContainer,
            shape: BoxShape.circle,
            boxShadow: cardShadow,
          ),
          child: Icon(icon, color: active ? Colors.white : AppColors.onPrimaryContainer),
        ),
        Icon(Icons.arrow_drop_down, color: active ? AppColors.primary : AppColors.primaryContainer, size: active ? 34 : 28),
      ],
    );
  }
}

class MapPreviewCard extends StatelessWidget {
  const MapPreviewCard({super.key, required this.restaurant});

  final Restaurant restaurant;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primaryContainer.withOpacity(0.6)),
        boxShadow: cardShadow,
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Image.network(restaurant.imageUrl, width: 96, height: 96, fit: BoxFit.cover),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(restaurant.name, style: Theme.of(context).textTheme.titleMedium, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text('${restaurant.category} • 0.2 mi', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.onSurfaceVariant)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const SmallTag(label: r'$$'),
                    const SizedBox(width: 8),
                    const SmallTag(label: 'Open'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SmallTag extends StatelessWidget {
  const SmallTag({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: AppColors.surfaceContainer, borderRadius: BorderRadius.circular(6)),
      child: Text(label, style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 10)),
    );
  }
}

class AddPage extends StatelessWidget {
  const AddPage({super.key, required this.onShareImport});

  final VoidCallback onShareImport;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        centerTitle: true,
        leading: IconButton(onPressed: () {}, icon: const Icon(Icons.close)),
        title: Text('New Entry', style: Theme.of(context).textTheme.headlineMedium),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
        children: [
          ImportBanner(onTap: onShareImport),
          const SizedBox(height: 24),
          Container(
            height: 210,
            decoration: BoxDecoration(
              color: AppColors.surfaceContainer,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.outlineVariant, width: 2),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_a_photo, size: 44, color: AppColors.outline),
                SizedBox(height: 8),
                Text('Upload Cover Photo'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const EntryFormCard(),
        ],
      ),
      bottomSheet: SafeArea(
        minimum: const EdgeInsets.all(20),
        child: SizedBox(
          width: double.infinity,
          height: 54,
          child: FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.primaryContainer),
            onPressed: () {},
            child: const Text('Save to Pocket List'),
          ),
        ),
      ),
    );
  }
}

class EntryFormCard extends StatelessWidget {
  const EntryFormCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(20),
        boxShadow: cardShadow,
      ),
      child: Column(
        children: [
          const TextField(decoration: InputDecoration(labelText: 'Restaurant Name', hintText: 'e.g. The Golden Spatula')),
          const SizedBox(height: 16),
          Row(
            children: const [
              Expanded(child: TextField(decoration: InputDecoration(labelText: 'Category', hintText: 'Cafe'))),
              SizedBox(width: 16),
              Expanded(child: TextField(decoration: InputDecoration(labelText: 'Location', hintText: 'Search address'))),
            ],
          ),
          const SizedBox(height: 16),
          const TextField(decoration: InputDecoration(labelText: 'Personal Notes', hintText: 'What stood out?'), maxLines: 3),
        ],
      ),
    );
  }
}

class ShareImportPage extends StatefulWidget {
  const ShareImportPage({super.key, required this.initialText});

  final String initialText;

  @override
  State<ShareImportPage> createState() => _ShareImportPageState();
}

class _ShareImportPageState extends State<ShareImportPage> {
  late final TextEditingController _sharedController;
  late final TextEditingController _nameController;
  late final TextEditingController _categoryController;
  late final TextEditingController _areaController;
  late final TextEditingController _mapsController;
  late final TextEditingController _notesController;
  bool _parsed = false;

  @override
  void initState() {
    super.initState();
    _sharedController = TextEditingController(text: widget.initialText);
    _nameController = TextEditingController();
    _categoryController = TextEditingController();
    _areaController = TextEditingController();
    _mapsController = TextEditingController();
    _notesController = TextEditingController();
    Future<void>.delayed(const Duration(milliseconds: 600), _parse);
  }

  @override
  void dispose() {
    _sharedController.dispose();
    _nameController.dispose();
    _categoryController.dispose();
    _areaController.dispose();
    _mapsController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        centerTitle: true,
        leading: IconButton(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close)),
        title: Text('匯入貼文', style: Theme.of(context).textTheme.headlineMedium),
        actions: [IconButton(onPressed: _parse, icon: const Icon(Icons.refresh))],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 96),
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(20),
              boxShadow: cardShadow,
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    Image.network('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', height: 190, width: double.infinity, fit: BoxFit.cover),
                    Positioned(
                      left: 16,
                      right: 16,
                      bottom: 16,
                      child: Row(
                        children: [
                          Expanded(child: Text('解析美食店家資訊', style: Theme.of(context).textTheme.displayLarge?.copyWith(color: Colors.white))),
                          const CircleAvatar(backgroundColor: AppColors.primaryContainer, child: Icon(Icons.auto_awesome, color: AppColors.onPrimaryContainer)),
                        ],
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('收到的分享內容', style: Theme.of(context).textTheme.titleMedium),
                          SmallTag(label: _parsed ? '高可信度' : '解析中'),
                        ],
                      ),
                      TextField(controller: _sharedController, maxLines: 4),
                      const SizedBox(height: 12),
                      LinearProgressIndicator(
                        value: _parsed ? 1 : null,
                        color: AppColors.primaryContainer,
                        backgroundColor: AppColors.surfaceContainer,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text('辨識結果', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.primaryContainer.withOpacity(0.35)),
              boxShadow: cardShadow,
            ),
            child: Column(
              children: [
                TextField(controller: _nameController, decoration: const InputDecoration(labelText: '店家名稱')),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(child: TextField(controller: _categoryController, decoration: const InputDecoration(labelText: '類型'))),
                    const SizedBox(width: 16),
                    Expanded(child: TextField(controller: _areaController, decoration: const InputDecoration(labelText: '地區'))),
                  ],
                ),
                const SizedBox(height: 14),
                TextField(controller: _mapsController, decoration: const InputDecoration(labelText: 'Maps 搜尋關鍵字')),
                const SizedBox(height: 14),
                TextField(controller: _notesController, decoration: const InputDecoration(labelText: '自動整理備註'), maxLines: 4),
              ],
            ),
          ),
        ],
      ),
      bottomSheet: SafeArea(
        minimum: const EdgeInsets.all(20),
        child: SizedBox(
          height: 54,
          width: double.infinity,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: AppColors.primaryContainer),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${_nameController.text.isEmpty ? '店家' : _nameController.text} 已加入想去名單')),
              );
            },
            icon: const Icon(Icons.bookmark_add),
            label: const Text('加入口袋名單'),
          ),
        ),
      ),
    );
  }

  void _parse() {
    final text = _sharedController.text;
    final hasOsteria = text.contains('Osteria Bianca');
    final name = hasOsteria ? 'Osteria Bianca' : _firstCandidate(text);
    final area = text.contains('台北') ? '台北' : '待確認';
    final category = hasOsteria ? '義式料理' : '待分類';
    final url = RegExp(r'https?:\/\/\S+').firstMatch(text)?.group(0) ?? '未偵測到連結';

    setState(() {
      _parsed = true;
      _nameController.text = name;
      _categoryController.text = category;
      _areaController.text = area;
      _mapsController.text = '$name $area';
      _notesController.text = '來源：${text.contains('threads.net') ? 'Threads' : 'Instagram'}\n推薦重點：${hasOsteria ? '松露手工寬麵' : '貼文推薦菜色'}\n原始連結：$url';
    });
  }

  String _firstCandidate(String text) {
    final lines = text.split('\n').map((line) => line.trim()).where((line) => line.isNotEmpty && !line.startsWith('http'));
    if (lines.isEmpty) return '待確認店家';
    final match = RegExp(r"[A-Z][A-Za-z'& ]{2,}|[\u4e00-\u9fa5・]{3,}").firstMatch(lines.first);
    return match?.group(0) ?? '待確認店家';
  }
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(trailing: Icons.settings_outlined),
      body: Center(
        child: Text('Profile', style: Theme.of(context).textTheme.displayLarge),
      ),
    );
  }
}

final cardShadow = [
  BoxShadow(
    color: Colors.black.withOpacity(0.06),
    blurRadius: 20,
    offset: const Offset(0, 4),
  ),
];
