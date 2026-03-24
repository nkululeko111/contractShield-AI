import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type JurisdictionItem = { id: string; name: string; shortName?: string };

type Props = {
  jurisdictions: JurisdictionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  label?: string;
};

export function JurisdictionPicker({
  jurisdictions,
  selectedId,
  onSelect,
  disabled,
  label = 'Legal jurisdiction',
}: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current =
    jurisdictions.find((j) => j.id === selectedId) ?? jurisdictions[0];

  if (!jurisdictions.length || !current) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {current.shortName || current.name}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={[
            styles.modalRoot,
            {
              paddingTop: insets.top + 8,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <Pressable
            style={styles.backdropFill}
            onPress={() => setOpen(false)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose jurisdiction</Text>
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {jurisdictions.map((j) => (
                <TouchableOpacity
                  key={j.id}
                  style={[
                    styles.row,
                    j.id === selectedId && styles.rowActive,
                  ]}
                  onPress={() => {
                    onSelect(j.id);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.rowTitle}>{j.name}</Text>
                  {j.shortName && j.shortName !== j.name ? (
                    <Text style={styles.rowSub}>{j.shortName}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerDisabled: { opacity: 0.55 },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginRight: 8,
  },
  chevron: { fontSize: 10, color: '#6B7280' },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '70%',
    padding: 16,
    zIndex: 2,
    elevation: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  list: { maxHeight: 400 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowActive: { backgroundColor: '#EBF4FF', borderRadius: 8 },
  rowTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  rowSub: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
});
