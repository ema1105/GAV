package GAV.GAV.Collections;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@Document(collection = "cars")
public class Cars {
    @Id
    private String id;

    private int capacity;
    private String brand;
    private String model;
    private String plate;
    private Category category;

    //Categorias de vehiculos del hotel
    public enum Category{
        SEDAN,
        SUV,
        MINIVAN,
        AUTOBUS,
        BUS
    }
    public Cars() {}

    public Cars(String id, int capacity, String brand,
                String model, String plate, Category category) {
        this.id = id;
        this.capacity = capacity;
        this.brand = brand;
        this.model = model;
        this.plate = plate;
        this.category = category;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() !=o.getClass()) return false;
        Cars cars = (Cars) o;
        return Objects.equals(getId(),cars.getId()) && Objects.equals(getPlate(), cars.getPlate());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getPlate());
    }

    @Override
    public String toString() {
        return "Cars{" +
                "id='" + id + '\'' +
                ", capacity=" + capacity +
                ", brand='" + brand + '\'' +
                ", model='" + model + '\'' +
                ", plate='" + plate + '\'' +
                ", category=" + category +
                '}';
    }
}

